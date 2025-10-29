/**
 * Atualiza automaticamente o bloco de skills no README.md
 * baseado nas linguagens mais usadas nos repositórios do usuário.
 */

const fs = require("fs");
const https = require("https");

const USERNAME = "ArthurCosta"; // <-- altere se o nome for diferente
const README_PATH = "./README.md";
const START = "<!--START_SECTION:skills-->";
const END = "<!--END_SECTION:skills-->";

// Mapeamento de badges por linguagem
const BADGES = {
  JavaScript: "![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black&style=flat)",
  TypeScript: "![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)",
  Python: "![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white&style=flat)",
  CSharp: "![C#](https://img.shields.io/badge/-C%23-239120?logo=c-sharp&logoColor=white&style=flat)",
  Java: "![Java](https://img.shields.io/badge/-Java-007396?logo=java&logoColor=white&style=flat)",
  HTML: "![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white&style=flat)",
  CSS: "![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white&style=flat)",
  PHP: "![PHP](https://img.shields.io/badge/-PHP-777BB4?logo=php&logoColor=white&style=flat)",
  Go: "![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white&style=flat)",
  Rust: "![Rust](https://img.shields.io/badge/-Rust-000000?logo=rust&logoColor=white&style=flat)",
  Shell: "![Shell](https://img.shields.io/badge/-Shell-FFD500?logo=gnu-bash&logoColor=black&style=flat)"
};

// Função auxiliar para fazer requisições HTTPS
function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "GitHub-Profile-Readme" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
  });
}

(async function main() {
  try {
    console.log("🔍 Buscando repositórios...");
    const repos = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`);
    const languageTotals = {};

    for (const repo of repos) {
      if (!repo.fork && repo.language) {
        languageTotals[repo.language] = (languageTotals[repo.language] || 0) + 1;
      }
    }

    const topLanguages = Object.entries(languageTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([lang]) => lang);

    console.log("📊 Linguagens detectadas:", topLanguages.join(", "));

    const badges = topLanguages
      .map((lang) => BADGES[lang] || `![${lang}](https://img.shields.io/badge/-${encodeURIComponent(lang)}-gray?style=flat)`)
      .join(" ");

    const readme = fs.readFileSync(README_PATH, "utf8");
    const newSection = `${START}\n${badges}\n${END}`;
    const updated = readme.replace(
      new RegExp(`${START}[\\s\\S]*${END}`, "m"),
      newSection
    );

    fs.writeFileSync(README_PATH, updated);
    console.log("✅ Bloco de skills atualizado!");
  } catch (err) {
    console.error("❌ Erro ao atualizar skills:", err);
    process.exit(1);
  }
})();
