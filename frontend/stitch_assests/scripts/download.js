const https = require('https');
const fs = require('fs');

const url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2UwNjVlOGE0NjAzYzQwYjJhZGQxZTdiNTU4YTQxY2VjEgsSBxDIj-uf2B8YAZIBJAoKcHJvamVjdF9pZBIWQhQxMzAzNjE2NDA2MTMzNDEwMzc1NQ&filename=&opi=89354086';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('ui_reference.html', data);
    console.log('Downloaded.');
  });
}).on('error', err => {
  console.error('Error: ', err.message);
});
