#!/usr/bin/env node
/** Regression checks for the factual, curated resume content. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { education } from '../data/education.ts';

execFileSync(process.execPath, ['scripts/generate-resume.mjs'], { stdio: 'inherit' });
for (const lang of ['en', 'fr']) {
  const data = JSON.parse(readFileSync(`resume-${lang}.json`, 'utf8'));
  assert.deepEqual(data.projects.map(p => p.name), ['min-btc-node', 'QGChat', 'nixos-config']);
  assert.equal(data.education.length, 2);
  assert.match(JSON.stringify(data.education), /IMT Nord Europe/);
  assert.match(JSON.stringify(data.education), /DUT/);
  assert.doesNotMatch(JSON.stringify(education[lang]), /Bachelor|M\.Eng|BUT\b/);
  assert.doesNotMatch(JSON.stringify(data.education), /Bachelor|M\.Eng|BUT\b/);
  const highlights = data.work.find(job => /Numih/.test(job.name)).highlights;
  assert.doesNotMatch(highlights.join(' '), /70\s*%/);
  assert.match(highlights.join(' '), /Java/);
  assert.match(highlights.join(' '), /Angular/);
  assert.match(highlights[0], /Spring Boot API|API Spring Boot/);
  assert.match(highlights[0], /launch, schedule and monitor|lancer, planifier et superviser/);
  assert.match(highlights[0], /asynchronous|asynchrone/);
  assert.match(highlights[0], /real-time|temps réel/);
  assert.match(highlights[0], /WebSockets/);
  assert.match(highlights[1], /Selenium\/Java/);
  assert.match(highlights[1], /Maven\/Jenkins/);
  assert.match(highlights[2], /test-data lifecycle|cycle de vie des données de test/);
  assert.match(data.basics.summary, /2027/);
  assert.match(data.basics.summary, /3.month|3 mois/);
  assert.doesNotMatch(data.basics.summary, /fin d'études/);
  assert.doesNotMatch(readFileSync(`data/posts/${lang}/automated-testing-framework.mdx`, 'utf8'), /70\s*%/);
}
assert.deepEqual(JSON.parse(readFileSync('resume.json')), JSON.parse(readFileSync('resume-en.json')));
console.log('Resume content: EN/FR factual claims, selected projects, availability and aliases OK');
