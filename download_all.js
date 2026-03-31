const fs = require('fs');

const screens = [
  {
    name: 'AttendanceHistory',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzVhMjgyOTUxZmE2ZDQyNThhMjE4MGM2ZjZiMmNkOTY5EgsSBxDIj-uf2B8YAZIBJAoKcHJvamVjdF9pZBIWQhQxMzAzNjE2NDA2MTMzNDEwMzc1NQ&filename=&opi=89354086',
    img: 'https://lh3.googleusercontent.com/aida/ADBb0ujMGhLZtN3r2wqfWBFbv5-ScbXuUCIMhQSRsHHV6cpV1y5zfsP_hYVGp6eKoB_uT5Hbhg6MNHfkjW3aLSMYowx9d3OdvTIeudw9ZeR2vI2MaLhHBPALNy0J60iRi5gx4a9YCmqwcenfdVWpdr8IzMMO-5XnAcXbYuugkXpfY8_Jfu_trvqyYROPjbgjmH0WTz3W_ylGK6phNpq9brteopwlmUefjbdiN7OtIBKa4CRkoSSZ1huaCe_v-xix'
  },
  {
    name: 'WeeklyTimetable',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzRkOTZhOTBjODRlZjRlOGE5NjkxOGJlNTEzODU0ODM3EgsSBxDIj-uf2B8YAZIBJAoKcHJvamVjdF9pZBIWQhQxMzAzNjE2NDA2MTMzNDEwMzc1NQ&filename=&opi=89354086',
    img: 'https://lh3.googleusercontent.com/aida/ADBb0uhndisKcBGGCmqqYb1v6CS8Q9vuJgOjNJbVCb6P4ypfebjBHkaMuAvRe87OG_3VORnX8YRzzgdxdLORlneZjUrlYwXB0P1qDSsik0Or39DcMx0H91HmQVQkrP26KqOnrpb0VF_AY48YgliOlCHHXEzqbA3uWFWMdERMDhF_2_2rPHNwR0u2d_JAMiq91Rt0UKfgUVa9egsMh5EllIDH_MkRx7JGHnZrButXFF60gpJHIQi9s_pnZPxV7_0c'
  },
  {
    name: 'SemesterResults',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzhmMGU4MjI4ZmM5ZDQyMjk4Zjg2OTg0OTJmYzRhZmJmEgsSBxDIj-uf2B8YAZIBJAoKcHJvamVjdF9pZBIWQhQxMzAzNjE2NDA2MTMzNDEwMzc1NQ&filename=&opi=89354086',
    img: 'https://lh3.googleusercontent.com/aida/ADBb0ugEs-WOEz6YtyB3QYOC9ANDviC5pUmipdErIT7ZM3O2DILDfXmbeJud8HWr_NF_VQF9lMO4qXuzIw7zOFbv9Pj6c1_OJ5_qN_iuPT6Odvic-9HpC7H34fqvWPnrv86Ax-AP238HJfQFV6qFnbYRr4cutmPHw88ZpMV5jf5Zu5m8Q96zq2IOr2lu2edGBfG4GMSApPVVTLcNc8JRoM7XtzFJJRNIcDsTxOm4D3ns7MQ1Cqalh_KXhXp3PFnw'
  },
  {
    name: 'StudentComplaints',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzA0NzUxMjJjNWViZjRiMDRiYzQzNmQ1OWU3MDJmYzI2EgsSBxDIj-uf2B8YAZIBJAoKcHJvamVjdF9pZBIWQhQxMzAzNjE2NDA2MTMzNDEwMzc1NQ&filename=&opi=89354086',
    img: 'https://lh3.googleusercontent.com/aida/ADBb0ui8Pdo1RimWLNyunTNU0tt_YElblFsSgnKF6abE_lHepR2g_gtH_SgOqIEP-vBEVCZcCAYaQ9ZytPE8BY4riLJCl4dfS9MLiWilW40HqGaLso1ePLlrRZE1_VspJjzDnZ6wudfT-or4BxsdtpNKnOkz8yHO-BZ9FIu-w7RsORVc0He9UueVW90XWy2sjrcIbxTByrVk_ZSMILW-Edm-T7GqSJw_vQlTkMKlQzLsP-XJQN2ZnLTARUzIKNks'
  },
  {
    name: 'MessMenu',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2E3YzViNWNhNGUxNjQyYzY4NjE5ZDg5NzgyZWQ4NTE5EgsSBxDIj-uf2B8YAZIBJAoKcHJvamVjdF9pZBIWQhQxMzAzNjE2NDA2MTMzNDEwMzc1NQ&filename=&opi=89354086',
    img: 'https://lh3.googleusercontent.com/aida/ADBb0uiyVYLjweDTMC5MLfNwMvZUCA-r9VhAk3C9W-_aoBGrRjmzh7XgyNfnoq5CwcW_FjEnj3o6KRnWnSyZEzctlWA-JtqMMdf4CCRWJPCg4e1IxNQk2sSp-NcwVtWEk2qoPGxFOYGo8P5Ew-R3NSpcryDMVkeM7dnk01nOUE7ZxwJPDvmgcjNuBXtS9PZHP-ngsrIkCqIISJXj6npF7mpUqmtZPzyZjVUolJ7JQp_gs-CWmQ-HTT0NaO7uNo_n'
  },
  {
    name: 'HostelInformation',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAyN2I2MDI0ZDlkODQ3NjFiNzE1MWRmNmUxZjUyM2MyEgsSBxDIj-uf2B8YAZIBJAoKcHJvamVjdF9pZBIWQhQxMzAzNjE2NDA2MTMzNDEwMzc1NQ&filename=&opi=89354086',
    img: 'https://lh3.googleusercontent.com/aida/ADBb0uhe1BMryLOxpkaOSllo3OjeQrGWYT3XZxavim59-BIiSlZePVhAgIXv73rbuNkmCOJYmx4i7hryGE_3kX6M_mOuxTHkngpWalQibCgTiAj3U-B5cXWK_hGuyfqhOgLuxbhlp2R7yoeZdomannx5iX8-ivdNQczGOyYOycPmD7y4BVifa3Jp3VvcTG18G67VFnNRQOiZce5FKHZu9PqJbG5yJB0RnBaGFQUtjWbl9KNTOyNwM0S7A0c2RaV2'
  }
];

async function download() {
  for (const screen of screens) {
    try {
      console.log(`Downloading ${screen.name}...`);
      
      const htmlRes = await fetch(screen.html);
      if (!htmlRes.ok) throw new Error(`${screen.name} HTML fetch failed: ${htmlRes.status}`);
      const htmlText = await htmlRes.text();
      fs.writeFileSync(`${screen.name}.html`, htmlText);
      console.log(`- ${screen.name}.html saved.`);

      const imgRes = await fetch(screen.img);
      if (!imgRes.ok) throw new Error(`${screen.name} IMG fetch failed: ${imgRes.status}`);
      const buffer = await imgRes.arrayBuffer();
      fs.writeFileSync(`${screen.name}.png`, Buffer.from(buffer));
      console.log(`- ${screen.name}.png saved.`);
    } catch(e) {
      console.error(`Error downloading ${screen.name}:`, e);
    }
  }
}

download().then(() => {
  console.log('All downloads completed.');
  process.exit(0);
});
