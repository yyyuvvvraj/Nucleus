const fs = require('fs');

async function download() {
  const url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2UwNjVlOGE0NjAzYzQwYjJhZGQxZTdiNTU4YTQxY2VjEgsSBxDIj-uf2B8YAZIBJAoKcHJvamVjdF9pZBIWQhQxMzAzNjE2NDA2MTMzNDEwMzc1NQ&filename=&opi=89354086';
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const text = await res.text();
    fs.writeFileSync('ui.html', text);
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
download();
