 let geplandeQuotes = [];
    let bewerkIndex = null;
    let huidigePopupQuote = null;

    let allQuotes = [
      { text: "We zullen het niveau van amateurisme nooit ontstijgen.", author: "Peter Leennhouts (Docent)" },
      { text: "I am your father.", author: "Darth Vader (Star Wars)" },
      { text: "Do or do not. There is no try.", author: "Yoda (Star Wars)" },
      { text: "It’s not the years, honey, it’s the mileage.", author: "Indiana Jones" },
      { text: "I’ll be back.", author: "Arnold Schwarzenegger (The Terminator)" }
    ];

    // Laad opgeslagen quotes
    window.onload = () => {
      const opgeslagen = localStorage.getItem("geplandeQuotes");
      if (opgeslagen) {
        geplandeQuotes = JSON.parse(opgeslagen).map(q => ({
          ...q,
          tijd: new Date(q.tijd),
          timeoutId: planPopup(q)
        }));
        toonQuotes();
      }
    };

    function planQuote() {
      const omschrijving = document.getElementById("omschrijving").value.trim();
      const tijd = new Date(document.getElementById("tijd").value);
      const dagelijks = document.getElementById("dagelijksCheckbox").checked;

      if (!omschrijving || isNaN(tijd)) {
        alert("Vul een omschrijving en een geldige tijd in!");
        return;
      }

      const msTotTijd = tijd - new Date();
      if (msTotTijd <= 0) {
        alert("De gekozen tijd ligt in het verleden.");
        return;
      }

      if (bewerkIndex !== null) {
        // Update bestaande afspraak
        clearTimeout(geplandeQuotes[bewerkIndex].timeoutId);
        geplandeQuotes[bewerkIndex].omschrijving = omschrijving;
        geplandeQuotes[bewerkIndex].tijd = tijd;
        geplandeQuotes[bewerkIndex].dagelijks = dagelijks;
        geplandeQuotes[bewerkIndex].timeoutId = planPopup(geplandeQuotes[bewerkIndex]);
        bewerkIndex = null;
        const btn = document.getElementById("planButton");
        btn.textContent = "Plan Quote";
        btn.classList.remove("edit-mode");
      } else {
        // Nieuwe afspraak
        const geplande = { omschrijving, tijd, dagelijks, timeoutId: null };
        geplande.timeoutId = planPopup(geplande);
        geplandeQuotes.push(geplande);
      }

      opslaan();
      toonQuotes();
      document.getElementById("omschrijving").value = "";
      document.getElementById("tijd").value = "";
      document.getElementById("dagelijksCheckbox").checked = false;
    }

    // Popup functies
    function planPopup(q) {
      const msTotTijd = q.tijd - new Date();
      if (msTotTijd > 0) {
        return setTimeout(() => {
          toonQuotePopup(q);
        }, msTotTijd);
      }
      return null;
    }

    function toonQuotePopup(q) {
      huidigePopupQuote = q;
      toonRandomQuoteInPopup(q);
      document.getElementById("quotePopup").style.display = "block";
    }

    function toonRandomQuoteInPopup(q) {
      const randomIndex = Math.floor(Math.random() * allQuotes.length);
      const randomQuote = allQuotes[randomIndex];
      document.getElementById("quoteTekst").textContent = `${q.omschrijving}\n\n"${randomQuote.text}"\n— ${randomQuote.author}`;
    }

    function nieuweQuote() {
      if (huidigePopupQuote) {
        toonRandomQuoteInPopup(huidigePopupQuote);
      }
    }

    function sluitPopup() {
      document.getElementById("quotePopup").style.display = "none";
      if (huidigePopupQuote) {
        if (!huidigePopupQuote.dagelijks) {
          const index = geplandeQuotes.findIndex(item => item === huidigePopupQuote);
          if (index > -1) {
            clearTimeout(geplandeQuotes[index].timeoutId);
            geplandeQuotes.splice(index, 1);
            opslaan();
            toonQuotes();
          }
        } else {
          // Plan opnieuw voor volgende dag
          huidigePopupQuote.tijd = new Date(huidigePopupQuote.tijd.getTime() + 24*60*60*1000);
          huidigePopupQuote.timeoutId = planPopup(huidigePopupQuote);
          opslaan();
          toonQuotes();
        }
        huidigePopupQuote = null;
      }
    }

    // Tabellen en bewerken
    function toonQuotes() {
      const tbody = document.querySelector("#quotesTable tbody");
      tbody.innerHTML = "";
      geplandeQuotes.forEach((q, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${q.omschrijving}</td>
          <td>${q.tijd.toLocaleString()}</td>
          <td>${q.dagelijks ? "Ja" : "Nee"}</td>
          <td>
            <button onclick="bewerkQuote(${index})"> Bewerk</button>
            <button onclick="verwijderQuote(${index})"> Verwijderen</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    function bewerkQuote(index) {
      const q = geplandeQuotes[index];
      document.getElementById("omschrijving").value = q.omschrijving;
      document.getElementById("tijd").value = q.tijd.toISOString().slice(0,16);
      document.getElementById("dagelijksCheckbox").checked = q.dagelijks;
      bewerkIndex = index;
      const btn = document.getElementById("planButton");
      btn.textContent = "Opslaan Wijziging";
      btn.classList.add("edit-mode");
    }

    function verwijderQuote(index) {
      clearTimeout(geplandeQuotes[index].timeoutId);
      geplandeQuotes.splice(index, 1);
      opslaan();
      toonQuotes();
    }

    function opslaan() {
      const opslagData = geplandeQuotes.map(q => ({
        omschrijving: q.omschrijving,
        tijd: q.tijd,
        dagelijks: q.dagelijks
      }));
      localStorage.setItem("geplandeQuotes", JSON.stringify(opslagData));
    }