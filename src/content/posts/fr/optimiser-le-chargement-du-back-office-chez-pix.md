---
layout: blog
title: "Réduire de 10 secondes le chargement d'un back office chez PIX"
pubDate: 2026-08-01
description: Comment un problème de chargement lent sur un back office EmberJS
  s'est résolu par une optimisation ciblée des données récupérées, pas par une
  réécriture.
author: Thomas Evano
tags:
  - pix
  - performance
  - emberjs
  - backoffice
---

Chez PIX, j'ai fait partie de l'équipe accès, en charge de tout ce qui touche à l'identification au sein de la plateforme, puis de l'équipe contenu, qui conçoit les épreuves interactives et améliore le quotidien de l'équipe métier.

## Le problème

Le back office, construit en EmberJS, mettait plusieurs secondes à charger certaines pages avant que l'équipe métier ne puisse commencer à travailler. Sur un outil utilisé plusieurs fois par jour, ce temps mort s'accumulait directement en perte de productivité pour les utilisateurs internes.

## Le diagnostic

Le ralentissement ne venait pas du rendu ni du framework, mais des données récupérées à l'ouverture des pages : trop de champs et de relations chargés d'un coup, alors que l'écran n'en affichait qu'une partie.

## La décision

Plutôt que de réécrire les vues ou d'ajouter du chargement différé partout, j'ai resserré les requêtes de données aux besoins réels de chaque page : moins de champs superflus, moins de relations chargées par défaut, données secondaires récupérées seulement si l'utilisateur les demandait.

## Le résultat

**10 secondes gagnées sur le chargement du back office** grâce à cette optimisation de la récupération des données, sans changement d'architecture ni de framework.

## Ce que j'en retiens

Le réflexe "optimiser = réécrire" est souvent un piège. Avant de changer d'outil ou de architecture, il faut d'abord vérifier si le problème est structurel ou simplement lié à ce qu'on demande au serveur de renvoyer. Ici, la deuxième option a suffi.

En parallèle de ce travail sur l'équipe accès, j'ai aussi participé à la modernisation du back office et à la montée de version d'EmberJS, qui a permis à l'équipe métier de gagner en productivité sur le reste de l'outil, ainsi qu'au déploiement d'un système de connexion SSO et à la réalisation d'une application de journalisation conforme au RGPD.
