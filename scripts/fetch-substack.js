#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUBSTACK_URL = 'https://healthinprogress.substack.com/feed';
const WRITING_MD = path.join(__dirname, '..', 'src', 'writing.md');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = (itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                   itemXml.match(/<title>(.*?)<\/title>/) || [])[1] || '';
    const link = (itemXml.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    const pubDate = (itemXml.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
    const description = (itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                        itemXml.match(/<description>(.*?)<\/description>/) || [])[1] || '';

    if (title && link) {
      items.push({
        title: title.trim(),
        link: link.trim(),
        date: pubDate ? new Date(pubDate) : null,
        description: description.replace(/<[^>]+>/g, '').substring(0, 100).trim()
      });
    }
  }

  return items.sort((a, b) => (b.date || 0) - (a.date || 0));
}

function formatDate(date) {
  if (!date) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function generateSubstackSection(posts) {
  if (posts.length === 0) {
    return '## Substack\n\nNo posts yet.';
  }

  const lines = ['## Substack', ''];
  for (const post of posts.slice(0, 10)) {
    const date = post.date ? ` — ${formatDate(post.date)}` : '';
    lines.push(`- [${post.title}](${post.link})${date}`);
  }
  lines.push('');
  lines.push(`[View all posts →](https://healthinprogress.substack.com)`);

  return lines.join('\n');
}

function updateWritingMd(substackSection) {
  let content = fs.readFileSync(WRITING_MD, 'utf-8');

  // Replace existing Substack section (from ## Substack to end or next ##)
  const substackRegex = /## Substack[\s\S]*?(?=\n## |$)/;

  if (substackRegex.test(content)) {
    content = content.replace(substackRegex, substackSection);
  } else {
    content = content.trimEnd() + '\n\n' + substackSection + '\n';
  }

  fs.writeFileSync(WRITING_MD, content);
  console.log('Updated src/writing.md');
}

async function main() {
  console.log('Fetching Substack RSS...');

  try {
    const xml = await fetch(SUBSTACK_URL);
    const posts = parseRSS(xml);
    console.log(`Found ${posts.length} posts`);

    const section = generateSubstackSection(posts);
    updateWritingMd(section);

  } catch (err) {
    console.error('Error fetching Substack:', err.message);
    process.exit(1);
  }
}

main();
