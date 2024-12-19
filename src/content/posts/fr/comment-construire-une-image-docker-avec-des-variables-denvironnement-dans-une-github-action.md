---
title: Comment construire une image Docker avec des variables d'environnement dans une GitHub action ?
pubDate: 2024-11-26
description: Afin de réduire le temps de build de l'image Docker de mon application lors du déploiement sur mon instance, j'ai eu l'idée de réaliser celui-ci via une github action. Voici ce que j'ai appris (ce n'était pas aussi simple que je le pensais.)
author: Thomas Evano
tags: ["docker", "github-action"]
draft: false
---
J'héberge mes projets sur une instance [Coolify](https://coolify.io). C'est génial, ça marche très bien, cela faisait un moment que je cherchais un PaaS qui me permettait d'héberger mes projets sur une instance que je possède. Le seul problème est qu'en utilisant la [version Cloud](https://coolify.io/cloud) (instance Coolify gérée par ces derniers), j'ai remarqué un temps de build d'application plutôt long, d'autant plus lorsqu'il s'agit d'une image Docker.
Afin de réduire ce temps de build, je me suis alors tourné vers une solution que je savais plus rapide, les github actions.

## Où mettre les variables dans Github ?

Mon image Docker nécessite des variables d'environnement pour fonctionner. Il faut alors les mettre quelque part sur Github. Pour cela, il suffit de se rendre dans les paramètres du repository.
![section paramètre du menu principal d'un repository github](../../../assets/articles/comment-construire-une-image-docker-avec-des-variables-denvironnement-dans-une-github-action/github_repository_settings_tabs.png)

Puis dans le menu vertical "Security" > "Secrets and Variables" > "actions"
![catégorie "security" du menu latéral des paramètres d'un repository github](../../../assets/articles/comment-construire-une-image-docker-avec-des-variables-denvironnement-dans-une-github-action/security_side_menu_repository_settings.png)

Lorsque l'on se retrouve sur cette page, il y a alors 4 emplacements divisés en 2 onglets où entrer ses variables. D'abord dans l'onglet "Secrets" dans la section "Environment secrets" ou "Repository secrets", puis dans l'onglet "Variables" qui est composé des mêmes emplacements.
![github actions secrets et variables](../../../assets/articles/comment-construire-une-image-docker-avec-des-variables-denvironnement-dans-une-github-action/actions_secrets_tab.png)

Les 2 premières lignes nous indiquent le meilleur emplacement selon notre besoin. Dans mon cas, vu qu'il s'agit de valeurs confidentielles, l'onglet **Secrets** est le plus adapté.

![mes secrets floutées](../../../assets/articles/comment-construire-une-image-docker-avec-des-variables-denvironnement-dans-une-github-action/github_repository_secrets.png)
Une fois toutes mes variables nécessaires rentrées dans la section 'repository secrets', il ne me reste plus qu'à les utiliser dans ma github action.

## Comment les utiliser dans la Github action

Il existe différentes manières de faire pour utiliser des variables d'environnement au travers d'une github action.
Comme tout bon développeur, j'ai d'abord suivi [la documentation Github](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#using-secrets-in-a-workflow), pensant naïvement que cela allait marcher du premier coup (spoiler: c'est rare en développement).
Mon erreur a été de ne pas tout de suite penser au fait que je voulais les transmettre à un Dockerfile. Une petite recherche plus tard, prenant ceci en considération, me voici consultant la [documentation Docker](https://docs.docker.com/build/ci/github-actions/secrets/) alors bien plus adapté à mon cas spécifique. Je m'applique donc à reproduire cela dans ma Github action, ce qui donne ce code:

```yaml
- name: Build image and push to registry
        uses: docker/build-push-action@v6.7.0
        with:
          context: .
          file: Dockerfile
          secrets: |
            "your_secret=${{ secrets.YOUR_SECRET }}"
          platforms: linux/amd64
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
```

## Utiliser la variable dans le Dockerfile

Dans la documentation de Docker citée précédemment, il est indiqué que la variable confidentielle doit être utilisée comme ceci :

```dockerfile
RUN --mount=type=secret,id=your_secret,env=YOUR_SECRET
```

Dans mon cas, cela n'a pas marché. C'est l'étape qui m'a causé le plus de problème, pendant un moment, il m'était impossible d'avoir cette valeur dans mon Dockerfile. Heureusement, un membre de la communauté du Discord de Coolify m'a bien aidé et est apparu avec cette solution :

```dockerfile
RUN  --mount=type=secret,id=your_secret \
  echo "YOUR_SECRET=$(cat /run/secrets/your_secret)" >> .env.production
```

Je vais être honnête, encore aujourd'hui, je ne sais pas comment cette magie opère, mais ça fonctionne. Si vous la comprenez, je suis preneur de tout aide pour comprendre comment cela fonctionne.

### ⚠️ Les variables doivent etre placé au moment du build dans votre Dockerfile, juste avant la commande

```bash
npm run build
```

## Conclusion

J'espère que cet article permettra d'aider d'autres personnes qui ont rencontré ce même problème. C'est mon premier article, et j'espère en écrire beaucoup d'autres sur des sujets qui me passionnent ou bien des problèmes que j'ai rencontrés et dont j'ai réussi a trouver la solution comme celui-ci. Je vous présente bientôt l'application pour laquelle j'ai rencontré ce problème. Pensez à vous abonner au fluxRSS pour ne rien louper, ainsi que me suivre sur Twitter [@tvn_dev](https://twitter.com/tvn_dev) et Bluesky [@tvn.dev](https://bsky.app/profile/tvn.dev).
