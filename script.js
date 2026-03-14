const SECRET_HASH = "cGFzc3dlYg=="; 
        let databaseDomandeTotale = []; // Contiene tutte le domande scaricate
        let domandeQuiz = [], domandaCorrente = 0, punteggio = 0, risposteUtente = []; 

        function showSection(id) {
            document.getElementById('home-hub').style.display = 'none';
            document.querySelector('.hero').style.display = 'none';
            document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
            document.getElementById(id).style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        function checkAuth() {
            const val = document.getElementById('pass-word').value.toLowerCase().trim();
            if(btoa(val) === SECRET_HASH) {
                loadQuizData();
            } else {
                alert("Parola non corretta! Verifica sul manuale.");
            }
        }

        function submitToGoogle(e) {
            e.preventDefault();
            const email = document.getElementById('email-input').value;
            const btn = document.getElementById('submit-btn');
            const msg = document.getElementById('newsletter-msg');
            btn.disabled = true;
            btn.innerText = "Invio...";
            
            fetch("https://script.google.com/macros/s/AKfycbxyQUkxrfwyVsu2ws8ACqkRgJUhc_KQ5KoVDNys_sj0NUCOjEPGQ_GGOvm0uIACcAxZNw/exec", {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ email: email })
            }).then(() => {
                msg.style.display = "block"; msg.style.backgroundColor = "#e8f5e9"; msg.innerText = "Iscrizione completata! 🎉";
                btn.disabled = false; btn.innerText = "Iscriviti Ora";
            }).catch(() => {
                msg.style.display = "block"; msg.style.backgroundColor = "#ffebee"; msg.innerText = "Errore. Riprova più tardi.";
                btn.disabled = false;
            });
        }

        function mescolaArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        async function loadQuizData() {
            try {
                const response = await fetch('domande.json');
                if (!response.ok) throw new Error("File json non trovato");
                const data = await response.json();
                
                // Controlliamo che i dati siano validi e contengano domande
                if (data && data.length > 0) {
                    databaseDomandeTotale = data;
                    mostraSceltaBlocchi(); 
                } else {
                    alert("Il file domande.json è vuoto o formattato male.");
                }
            } catch (e) { 
                alert("Errore di connessione o file domande.json non trovato. Stai testando in locale? Ricorda di caricarlo su GitHub per vederlo funzionare!"); 
                console.error(e);
            }
        }

        function mostraSceltaBlocchi() {
            showSection('quiz-setup');
            const totali = databaseDomandeTotale.length;
            
            document.getElementById('quiz-setup').innerHTML = `
                <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                    <button onclick="showSection('quiz-auth')" class="btn-back-hub" style="float:left;">← Indietro</button>
                    <div style="clear: both;"></div>
                    
                    <h2 style="color: var(--secondary); margin-bottom: 20px; font-size: 2rem;">Quante domande vuoi affrontare?</h2>
                    <p style="font-size: 1.1rem; color: #555; margin-bottom: 30px;">Il database contiene ${totali} domande in totale. Scegli un blocco per la tua simulazione:</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 15px; max-width: 400px; margin: 0 auto;">
                        <button class="btn" onclick="preparaQuiz(10)" style="font-size: 1.1rem;">Test Rapido (10 Domande)</button>
                        <button class="btn" onclick="preparaQuiz(20)" style="font-size: 1.1rem;">Simulazione Breve (20 Domande)</button>
                        <button class="btn" onclick="preparaQuiz(50)" style="font-size: 1.1rem;">Simulazione Media (50 Domande)</button>
                        <button class="btn" onclick="preparaQuiz(${totali})" style="font-size: 1.1rem; background-color: var(--secondary);">Simulazione Completa (Tutte)</button>
                    </div>
                </div>
            `;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function preparaQuiz(numeroDomandeScelte) {
            let copiaDati = [...databaseDomandeTotale];
            domandeQuiz = mescolaArray(copiaDati).slice(0, numeroDomandeScelte);
            
            domandeQuiz.forEach(q => {
                let opts = q.opzioni.map((testo, index) => ({ testo, isCorretta: index === q.corretta }));
                opts = mescolaArray(opts);
                q.opzioniMescolate = opts.map(opt => opt.testo);
                q.indiceCorrettoMescolato = opts.findIndex(opt => opt.isCorretta);
            });
            
            domandaCorrente = 0;
            punteggio = 0;
            risposteUtente = [];
            
            mostraDomanda(); 
        }

        function mostraDomanda() {
            const q = domandeQuiz[domandaCorrente];
            document.getElementById('quiz-setup').innerHTML = `
                <div style="max-width: 800px; margin: 0 auto; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <button onclick="mostraSceltaBlocchi()" class="btn-back-hub" style="margin-bottom: 0;">← Cambia Blocco</button>
                        <button onclick="location.reload()" class="btn-back-hub" style="margin-bottom: 0; background: #ffebee; color: #c62828; border-color: #c62828;">Esci all'Hub</button>
                    </div>
                    <p style="font-weight: bold; color: var(--secondary); border-bottom: 2px solid var(--bg); padding-bottom: 10px;">
                        Domanda ${domandaCorrente + 1} di ${domandeQuiz.length} | Punteggio: ${punteggio}
                    </p>
                    <h3 style="margin-bottom: 30px; font-size: 1.3rem;">${q.domanda}</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        ${q.opzioniMescolate.map((opt, i) => `
                            <button id="btn-opt-${i}" class="btn-opzione" onclick="verificaRisposta(${i})" 
                                    style="background: white; border: 2px solid var(--bg); padding: 15px; border-radius: 8px; text-align: left; font-size: 1.05rem; cursor: pointer;">
                                ${opt}
                            </button>`).join('')}
                    </div>
                    <div id="feedback-container" style="display:none; margin-top: 25px; padding: 20px; border-radius: 8px;"></div>
                </div>`;
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }

        function verificaRisposta(idx) {
            const q = domandeQuiz[domandaCorrente];
            const correct = (idx === q.indiceCorrettoMescolato);
            risposteUtente.push({ domanda: q.domanda, corretta: correct, spiegazione: q.spiegazione });
            if (correct) punteggio++;

            document.querySelectorAll('.btn-opzione').forEach((btn, i) => {
                btn.disabled = true;
                if(i === q.indiceCorrettoMescolato) {
                    btn.style.backgroundColor = "#e8f5e9";
                    btn.style.borderColor = "#4caf50";
                    btn.style.color = "#2e7d32";
                    btn.style.fontWeight = "bold";
                } else if(i === idx) {
                    btn.style.backgroundColor = "#ffebee";
                    btn.style.borderColor = "#f44336";
                    btn.style.color = "#c62828";
                }
            });

            const feed = document.getElementById('feedback-container');
            feed.style.display = "block";
            feed.style.backgroundColor = correct ? "#e8f5e9" : "#ffebee";
            feed.style.border = `1px solid ${correct ? '#4caf50' : '#f44336'}`;
            feed.innerHTML = `<h4 style="margin-top:0; color: ${correct ? '#2e7d32' : '#c62828'};">${correct ? '✅ Esatto!' : '❌ Errore'}</h4>
                              <p style="margin-bottom: 20px;"><strong>Spiegazione:</strong> ${q.spiegazione}</p>
                              <button class="btn" onclick="prossimaDomanda()" style="width: auto; padding: 10px 25px;">Avanti ➔</button>`;
            feed.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function prossimaDomanda() {
            domandaCorrente++;
            if (domandaCorrente < domandeQuiz.length) mostraDomanda();
            else mostraRisultato();
        }

        function mostraRisultato() {
            const perc = Math.round((punteggio / domandeQuiz.length) * 100);
            const errori = risposteUtente.filter(r => !r.corretta);
            let messaggioFinale = perc >= 80 ? "Ottimo lavoro! Preparazione solida." : (perc >= 60 ? "Buon risultato, ma puoi migliorare." : "Hai bisogno di ripassare il manuale.");
            
            document.getElementById('quiz-setup').innerHTML = `
                <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                    <h2 style="color: var(--secondary); font-size: 2.5rem; margin-bottom: 10px;">Quiz Completato!</h2>
                    <p style="font-size: 1.5rem; margin-top: 0;">Punteggio: <strong>${punteggio}/${domandeQuiz.length}</strong> (${perc}%)</p>
                    <p style="font-size: 1.1rem; color: #555; margin-bottom: 30px;">${messaggioFinale}</p>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 40px;">
                        <button class="btn-back-hub" onclick="mostraSceltaBlocchi()" style="margin-bottom: 0;">↻ Nuova Simulazione</button>
                        <button class="btn" onclick="location.reload()" style="max-width: 200px; margin-bottom: 0;">Torna all'Hub</button>
                    </div>

                    ${errori.length > 0 ? `
                        <div style="text-align: left; background: var(--bg); padding: 30px; border-radius: 12px; margin-top: 30px; margin-bottom: 40px;">
                            <h3 style="color: var(--secondary); margin-top: 0; border-bottom: 2px solid white; padding-bottom: 10px;">Riepilogo Errori:</h3>
                            ${errori.map((err, i) => `
                                <div style="margin-bottom: 25px;">
                                    <p style="font-weight: bold; margin-bottom: 5px;">${i+1}. ${err.domanda}</p>
                                    <p style="margin-top: 0; color: #d32f2f; font-size: 0.95rem;"><em>Spiegazione:</em> ${err.spiegazione}</p>
                                </div>
                            `).join('')}
                        </div>` : ''}
                </div>`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }