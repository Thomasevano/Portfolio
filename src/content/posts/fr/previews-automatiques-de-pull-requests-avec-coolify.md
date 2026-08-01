---
title: Déployer des previews automatiques de pull requests avec Coolify et GitHub Actions
pubDate: 2026-07-30
description: Pour MusicKeeper, chaque pull request déploie désormais automatiquement une preview qui tourne sur la vraie image Docker de production, avec ses propres tests end-to-end. Voici comment je l'ai construit, et le piège Coolify qui m'a fait chasser un 502 pendant un moment.
author: Thomas Evano
draft: true
tags:
  - musickeeper
  - coolify
  - github-action
  - buildinpublic
---

Sur MusicKeeper, jusqu'ici, une pull request ne me disait que deux choses : "le build passe" et "les tests unitaires passent". Ça ne me disait jamais si l'application tournait vraiment, avec la vraie image Docker, sur une vraie URL accessible. Je voulais un vrai environnement de preview par pull request, jetable, qui utilise l'image exacte qui partirait en production si je mergeais.

Comme j'héberge déjà MusicKeeper sur [Coolify](https://coolify.io) (version Cloud), et que MusicKeeper est une application sans base de données (toutes les données utilisateur vivent dans l'IndexedDB du navigateur), le terrain était plutôt favorable : pas de migration à jouer, pas d'état partagé à gérer, une preview est complètement jetable.

## L'objectif

Pour chaque pull request qui vient du repository lui-même (pas d'un fork, pour ne pas exposer mes secrets) :

1. Construire l'image Docker de production, avec le même `Dockerfile` que le build de release.
2. La pousser sur GHCR avec un tag propre à cette pull request.
3. Déployer cette image exacte sur une application Coolify dédiée aux previews.
4. Attendre que Coolify confirme que le déploiement est terminé.
5. Attendre que l'URL de preview réponde en HTTP 200.
6. Lancer la suite Playwright existante contre cette URL de preview, pas contre un serveur local.
7. Commenter la pull request avec l'URL et le tag de l'image utilisée.
8. Supprimer la preview Coolify quand la pull request se ferme ou se merge.

Le point important : ce n'est pas un test de build, c'est un test de production. Si l'image tourne, répond, et passe les tests end-to-end sur son URL publique, alors je sais que ce qui sera déployé fonctionne réellement.

## Pourquoi ne pas utiliser les previews natives de Coolify

Coolify sait déjà créer des previews automatiquement pour les pull requests, mais dans son mode natif basé sur Git : il reconstruit l'image lui-même à partir du code source, à chaque preview. Ce n'était pas ce que je voulais, pour deux raisons :

- Ça duplique un build que GitHub Actions fait déjà pour la release, et ça consomme les ressources de mon instance Coolify Cloud pour rien.
- Surtout, ça teste une image différente de celle qui sera réellement publiée. Une preview qui build son propre artefact ne garantit pas que l'image de release, elle, fonctionne.

Coolify propose un deuxième mode, moins documenté : si l'application est configurée en **Docker Image** (au lieu d'un Git repository), l'API de déploiement accepte deux paramètres, `pr` et `docker_tag`, qui créent la preview à la volée à partir d'une image déjà construite. Aucune preview n'a besoin d'exister au préalable côté Coolify, l'appel API la crée lui-même. C'est exactement ce qu'il me fallait : GitHub Actions construit l'image, GitHub Actions dit à Coolify "déploie ce tag pour cette pull request", et Coolify s'occupe du reste.

## Le workflow GitHub Actions

Le tag de l'image contient à la fois le numéro de la pull request et le SHA du commit :

```yaml
- name: Compute image tag
  id: tag
  env:
    HEAD_SHA: ${{ github.event.pull_request.head.sha }}
    PR: ${{ github.event.pull_request.number }}
  run: echo "docker_tag=pr-${PR}-${HEAD_SHA:0:7}" >> "$GITHUB_OUTPUT"
```

C'est volontaire : un tag mutable comme `pr-35` risquerait de faire redéployer Coolify avec une image en cache au lieu du dernier commit. En incluant le SHA, chaque push produit un tag différent, donc Coolify est forcé de tirer la nouvelle image.

Une fois l'image poussée sur GHCR, l'appel de déploiement ressemble à ça :

```bash
curl -sS -X POST \
  -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
  "${COOLIFY_URL}/api/v1/deploy?uuid=${APP_UUID}&pr=${PR}&docker_tag=${DOCKER_TAG}"
```

Le workflow interroge ensuite le endpoint de statut du déploiement toutes les 5 secondes jusqu'à obtenir `finished`, `failed`, ou `cancelled-by-user`. Une fois le déploiement terminé, il boucle une deuxième fois, mais cette fois sur l'URL de preview elle-même, jusqu'à recevoir un HTTP 200 :

```bash
for _ in $(seq 1 60); do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "${PREVIEW_URL}/" || echo 000)
  [ "${code}" = '200' ] && exit 0
  sleep 5
done
```

Ce sont deux échecs différents et il fallait les distinguer : Coolify peut très bien répondre "déploiement terminé" alors que le conteneur crashe juste après au démarrage. Sans ce deuxième contrôle, le workflow aurait annoncé un succès sur une preview morte.

Une fois que l'URL répond, la suite Playwright existante tourne directement contre elle, plutôt que contre le serveur de développement local :

```ts
// playwright.config.ts
webServer: process.env.PLAYWRIGHT_BASE_URL
  ? undefined
  : { command: 'pnpm dev', url: 'http://127.0.0.1:63136' },
baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:63136',
```

Pas de suite de tests dupliquée, pas de configuration séparée : les mêmes tests valident le dev local et la preview de production, seule la cible change.

Enfin, la pull request reçoit un commentaire avec l'URL et le tag de l'image, mis à jour à chaque push plutôt que dupliqué :

| | |
| --- | --- |
| URL | `https://pr-35.preview.musickeeper.app` |
| Image | `ghcr.io/thomasevano/musickeeper:pr-35-a1b2c3d` |

Et à la fermeture de la pull request, un dernier appel API supprime la preview côté Coolify :

```bash
curl -X DELETE "${COOLIFY_URL}/api/v1/applications/${APP_UUID}/previews/${PR}"
```

## Le piège : deux jeux de variables d'environnement

Une fois tout ça branché, le déploiement se terminait bien, Coolify annonçait "finished", mais l'URL de preview répondait systématiquement `502 Bad Gateway`. J'avais pourtant copié la configuration de l'application de production, avec les mêmes variables d'environnement, donc a priori tout aurait dû fonctionner.

En regardant les logs du conteneur, l'erreur était pourtant limpide :

```text
Missing environment variable "APP_KEY"
```

Alors que cette variable était bien présente dans les paramètres de l'application. Le détail qui m'a échappé : dans Coolify, une application possède **deux collections de variables d'environnement séparées**, pas une seule.

- **Production Environment Variables**
- **Preview Deployments Environment Variables**

Le workflow envoie `pr=<numéro>` à l'API de déploiement, ce qui indique explicitement à Coolify qu'il s'agit d'un déploiement de preview. Coolify lit alors la collection *preview*, pas la collection *production*, quelle que soit l'application concernée. Avoir une application entièrement dédiée aux previews n'y change rien : ce qui détermine quelle collection est lue, c'est le paramètre `pr` dans la requête, pas l'usage prévu de l'application. Comme je n'avais renseigné les variables que dans la section production, la collection preview était vide, et le conteneur s'arrêtait avant même de pouvoir répondre à une requête, d'où le `502`.

La correction a été simplement de copier les variables nécessaires dans la section **Preview Deployments Environment Variables** de l'application dédiée :

```text
APP_KEY=<secret-de-preview-different-de-la-prod>
LOG_LEVEL=info
MB_APP_CONTACT_EMAIL=preview@example.com
SESSION_DRIVER=cookie
PORT=8080
NODE_ENV=production
HOST=0.0.0.0
```

Une fois ces variables présentes, en Runtime Variable, le conteneur démarrait, l'URL répondait en 200, et la suite Playwright passait contre la preview réelle. J'en ai profité pour utiliser un `APP_KEY` différent de celui de la production, pour ne pas partager la même clé de chiffrement entre les deux environnements.

## Ce que ça donne au final

À chaque pull request de MusicKeeper qui vient du repository lui-même :

- Une image Docker identique à celle de release est construite et poussée.
- Elle est déployée sur une URL déterministe : `pr-<numéro>.preview.musickeeper.app`.
- La suite de tests end-to-end tourne contre cette URL réelle, pas contre un mock.
- Un commentaire automatique donne le lien direct pour tester la pull request.
- Tout est nettoyé automatiquement à la fermeture.

C'est le genre de garde-fou que j'aurais aimé avoir plus tôt : ça transforme "le build passe" en "l'application marche vraiment, en HTTPS, sur son image de production". J'ai documenté toute la configuration Coolify et GitHub, ainsi que la procédure de reproduction complète, dans [`docs/pr-previews.md`](https://github.com/Thomasevano/musickeeper/blob/main/docs/pr-previews.md) du repository, pour ne pas avoir à tout redécouvrir la prochaine fois que j'aurai besoin de reproduire ça sur un autre projet.

Le tout est visible dans la [pull request #35](https://github.com/Thomasevano/musickeeper/pull/35), sur le repository open source de [MusicKeeper](https://github.com/Thomasevano/musickeeper). N'hésitez pas à aller y jeter un œil, et à me suivre dans la construction en public du projet sur Twitter [@tvn_dev](https://twitter.com/tvn_dev) et Bluesky [@tvn.dev](https://bsky.app/profile/tvn.dev).
</content>
