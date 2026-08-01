---
layout: blog
title: "Cutting 10 seconds off a back office's load time at PIX"
pubDate: 2026-08-01
description: How a slow-loading EmberJS back office got fixed by tightening
  what data was fetched, not by rewriting anything.
author: Thomas Evano
tags:
  - pix
  - performance
  - emberjs
  - backoffice
---

At PIX, I worked on the access team, responsible for everything related to authentication on the platform, then on the content team, which designs interactive assessments and improves the day-to-day tooling for the business team.

## The problem

The back office, built in EmberJS, took several seconds to load certain pages before the business team could start working. On a tool used multiple times a day, that dead time added up to real lost productivity for internal users.

## The diagnosis

The slowdown wasn't coming from rendering or the framework — it was the data fetched on page load: too many fields and relations pulled at once, when the screen only displayed a fraction of them.

## The decision

Instead of rewriting the views or bolting lazy-loading everywhere, I tightened the data queries to what each page actually needed: fewer unnecessary fields, fewer relations loaded by default, secondary data fetched only when the user requested it.

## The result

**10 seconds cut from the back office's load time** through this data-fetching optimization, with no architecture or framework change.

## What I took from it

The instinct to "optimize by rewriting" is often a trap. Before swapping tools or architecture, check whether the problem is structural or simply about what you're asking the server to return. Here, the latter was enough.

Alongside this work on the access team, I also contributed to modernizing the back office and upgrading its EmberJS version, which helped the business team work faster across the rest of the tool, deployed an SSO login system, and built a GDPR-compliant logging application.
