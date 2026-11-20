#!/usr/bin/env node
/** Regression checks for the factual, curated resume content. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { education } from '../data/education.ts';

execFileSync(process.execPath, ['scripts/generate-resume.mjs'], { stdio: 'inherit' });
for (const lang of ['en', 'fr']) {
  const data = JSON.parse(readFileSync(`resume-${lang}.json`, 'utf8'));
  assert.deepEqual(data.projects.map(p => p.name), ['RayTracer', 'min-btc-node', 'nixos-config']);
  assert.equal(data.education.length, 2);
  assert.match(JSON.stringify(data.education), /IMT Nord Europe/);
  assert.match(JSON.stringify(data.education), /DUT/);
  assert.doesNotMatch(JSON.stringify(education[lang]), /Bachelor|M\.Eng|BUT\b/);
  assert.doesNotMatch(JSON.stringify(data.education), /Bachelor|M\.Eng|BUT\b/);
  const highlights = data.work.find(job => /Numih/.test(job.name)).highlights;
  assert.doesNotMatch(highlights.join(' '), /70\s*%/);
  assert.match(highlights.join(' '), /Java/);
  assert.match(highlights.join(' '), /Angular/);
  const professional = highlights.join(' ');
  assert.match(professional, /Spring Boot/);
  assert.match(professional, /Selenium\/Java/);
  assert.match(professional, /Maven\/Jenkins/);
  assert.match(professional, /asynchronous|asynchrone/);
  assert.match(professional, /WebSocket/);
  assert.match(professional, /end to end|intégrale/);
  assert.match(professional, /test-data lifecycle|cycle de vie des données/);
  assert.match(data.projects[0].description, /Academic|académique/);
  assert.match(data.projects[0].description, /JUnit 5/);
  assert.equal(data.projects[0].url, 'https://github.com/Strange500/RayTracer');
  assert.match(data.basics.summary, /2027/);
  assert.match(data.basics.summary, /3.month|3 mois/);
  assert.doesNotMatch(data.basics.summary, /fin d'études/);
  const article = readFileSync(`data/posts/${lang}/automated-testing-framework.mdx`, 'utf8');
  if (/70\s*%/.test(article)) assert.match(article, /Estimation déclarée|Reported estimate/);
}
assert.deepEqual(JSON.parse(readFileSync('resume.json')), JSON.parse(readFileSync('resume-en.json')));
console.log('Resume content: EN/FR factual claims, selected projects, availability and aliases OK');
