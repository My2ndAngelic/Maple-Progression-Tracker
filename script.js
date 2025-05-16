  async function fetchYAML(path) {
      const res = await fetch(path);
      const text = await res.text();
      return jsyaml.load(text);
    }

    function computeArcaneForce(symbols) {
      return Object.values(symbols).reduce((sum, lvl) => sum + 30 + 10 * (lvl - 1), 0);
    }

    async function renderCharacters() {
      const accountData = await fetchYAML('account.yaml');
      const jobList = (await fetchYAML('joblist.yaml')).jobs;

      const tbody = document.querySelector('#character-table tbody');
      accountData.characters.forEach(char => {
        const jobInfo = jobList[char.jobName] || {};
        const arcForce = computeArcaneForce(char.arcaneSymbols || {});

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${char.ign}</td>
          <td>${jobInfo.fullName || char.jobName}</td>
          <td>${jobInfo.archetype || 'Unknown'}</td>
          <td>${jobInfo.faction || 'Unknown'}</td>
          <td>${arcForce}</td>
        `;
        tbody.appendChild(row);
      });
    }

    renderCharacters();