const fs = require('fs');

async function download() {
  const htmlUrl = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2UwNjVlOGE0NjAzYzQwYjJhZGQxZTdiNTU4YTQxY2VjEgsSBxDIj-uf2B8YAZIBJAoKcHJvamVjdF9pZBIWQhQxMzAzNjE2NDA2MTMzNDEwMzc1NQ&filename=&opi=89354086';
  const imgUrl = 'https://lh3.googleusercontent.com/aida/ADBb0ujn2AdxGt3TVqSbqcw5R7c6EO-YLyRXMNP90ritVent8wX_Ov0T4rPq79TmSWEMcxTTs_aaXZRw8M2bJtJyaupaR6IBh-mBfbYaTQpMnmusY38iraKrGLHgSFkONaVdo0E59CrL40bpPaqwW4Aa3NCO2s_J_WqQn6jnG6GTDrupPtg02f9APnN_69lYkS4BjFat3yvtLDFq_iV8BoiCsxptf4FXPPeJePw_C7RVp__jxIHX1iXAoZsgxVRw';

  try {
    console.log('Fetching HTML...');
    const htmlRes = await fetch(htmlUrl);
    if (!htmlRes.ok) throw new Error(`HTML fetch failed: ${htmlRes.status}`);
    const htmlText = await htmlRes.text();
    fs.writeFileSync('StudentDashboard.html', htmlText);
    console.log('HTML saved.');

    console.log('Fetching image...');
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
    const buffer = await imgRes.arrayBuffer();
    fs.writeFileSync('StudentDashboard.png', Buffer.from(buffer));
    console.log('Image saved.');

    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

download();
