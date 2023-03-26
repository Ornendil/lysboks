function lysboks(props) {
    "use strict";

    // Standarverdier
    if (props === undefined) {
        props = {};
    }
    if (props.beholder === undefined) {
        props.beholder = ".bildegalleri";
    }
    if (props.hastighet === undefined) {
        props.hastighet = 200;
    }
    if (props.lukk === undefined) {
        props.lukk = "ingen"
    }

    // Variabler
    let bilder = [],
        body = document.body,
        bodyOverflow = getComputedStyle(body)["overflow"],
        bodyMarginRight = parseInt(getComputedStyle(body)["marginRight"].replace('px','')),
        scrollBarWidth = (window.innerWidth - document.documentElement.clientWidth);

    document.addEventListener("DOMContentLoaded", () => {
        // Lag en array med alle bilde-lenkene
        let bib = document.querySelectorAll(props.beholder + ' a:has(>img)'),
            y = 0;

        // Gå gjennom alle bilde-lenkene og sjekk om de faktisk går til bilder
        let promises = [];
        bib.forEach((el) => {
            promises.push(doesImageExist(el));
        });

        // Vent til alle bilde-lenkene er sjekket
        Promise.all(promises).then((values) => {
            for (let i = 0; i < values.length; i++) {
                let el = values[i];

                // Legg bildet til i bilder-arrayen hvis det faktisk er et bilde
                if (el.isImage == true){
                    leggTilIArray(el.element);
                    el.element.dataset.target = y;
                    y++;
                } else {
                    console.log('Et bilde lot seg ikke legge i lista: ' +  el.element);
                }
            }
            genererLysboks();
            addLysboksHendelesLyttere();
        });
    });

    // Legg til bilde i bilder-arrayen
    function leggTilIArray(el){
        const title = el.querySelector('img').getAttribute("title");
        bilder.push({
            "stor": el.getAttribute("href"),
            "liten": el.querySelector('img').getAttribute("src"),
            "litenH": el.querySelector('img').getBoundingClientRect().height,
            "litenW": el.querySelector('img').getBoundingClientRect().width,
            ... title == null ? { title: '' } : {title: title},
        });
    }

    // Sett hendelseslyttere
    function addLysboksHendelesLyttere(){

        // Åpne lysboksen ved å trykke på et av bildene
        document.querySelectorAll(props.beholder + ' [data-target]').forEach(el => {
            el.addEventListener("click", (event) => {
                event.preventDefault();
                aapneLysboksen(parseInt(el.dataset.target));
            });
        })

        // Lukk lysboksen ved å trykke på lukkeknappen eller utenfor bildet
        document.querySelectorAll("#lysboks, #lysboksLukk").forEach(closer => {
            closer.addEventListener('click', (event) => {
                if (event.currentTarget !== event.target) {
                    return;
                }
                document.querySelector('#lysboks').classList.replace('show', 'hide');

                skjulRullefelt(false);
            }, false);
        });

        // Bytt bilde ved å trykke på en av miniatyrbildene eller venstre- eller høyre-knappene
        document.querySelectorAll('.miniatyrBilde, #lysboksLeft, #lysboksRight').forEach(changer => {
            changer.addEventListener("click", (event) => {
                let w = parseInt(changer.dataset.target);

                document.querySelector('#lysboksMain').style.transitionDuration = props.hastighet / 2 + 'ms';
                document.querySelector('#lysboksMain').classList.add('hide');
        
                setTimeout(() => {
                    changeLysboksBilde(w);
                }, props.hastighet / 2);
            });
        });
    }

    // Åpne lysboksen
    function aapneLysboksen(i){
        changeLysboksBilde(i);
        document.querySelector('#lysboks').classList.replace('hide', 'show');
        skjulRullefelt(true);
    }

    // Generer lysboksen
    function genererLysboks(){
        let lysboksHTML = `
        <div id="lysboks" class="hide" style="transition-duration:` + props.hastighet + `ms">
            <div id="lysboksMain">
                <div id="lysboksBildeWrapper">
                    <div id="lysboksLeft"><svg viewBox="0 0 350 500" fill="#000000"><polygon points="350,100 250,0 0,250 250,500 350,400 200,250"></polygon></svg></div>
                    <div id="lysboksBilde"><img></div>
                    <div id="lysboksRight"><svg viewBox="0 0 350 500" fill="#000000"><polygon points="0,100 100,0 350,250 100,500 0,400 150,250"/></svg></div>
                </div>
                <div id="lysboksTooltip"></div>
            </div>
            <div id="miniatyrBilder"></div>
        </div>
        `;
        let lysDiv = document.createElement('div');
        body.appendChild(lysDiv);
        lysDiv.outerHTML = lysboksHTML;

        genererMiniatyrbilder();
        lagLukkeknapp();
    }

    // Generer miniatyrbilder
    function genererMiniatyrbilder(){
        let miniatyrBildeBoks = document.querySelector('#miniatyrBilder');
        for (let y = 0; y < bilder.length; y++) {
            let miniBilde = document.createElement('div');
            miniBilde.setAttribute('data-target', y);
            miniBilde.setAttribute('data-bilde', bilder[y].stor);
            miniBilde.setAttribute('class', 'miniatyrBilde');
            miniBilde.setAttribute('id', 'miniatyrBilde' + y);
            miniBilde.innerHTML = `<img src="` + bilder[y].liten + `" title="` + bilder[y].title + `">`;
            miniatyrBildeBoks.appendChild(miniBilde);
        }
    }

    // Generer lukkeknapp
    function lagLukkeknapp(){
        // Lag en lukk-knapp
        let lysboksLukkKnapp = document.createElement('div');
        lysboksLukkKnapp.setAttribute('id', 'lysboksLukk');
        lysboksLukkKnapp.innerHTML = '<svg viewBox="0 0 500 500"><polygon points="0,100 100,0 250,150 400,0 500,100 350,250 500,400 400,500 250,350 100,500 0,400 150,250"/>';
        
        // Sett lukk-knappen inn der du vil ha den
        if (props.lukk === "bilde") {
            document.querySelector('#lysboksBilde').appendChild(lysboksLukkKnapp);
        } else if (props.lukk === "utenfor") {
            document.querySelector('#lysboks').appendChild(lysboksLukkKnapp);
        }
    }

    // Bytt bilde i lysboksen
    function changeLysboksBilde(i) {
        changeCurrentLysbildeData(i);
        document.querySelector('#lysboksMain').style.transitionDuration = props.hastighet + 'ms';
        document.querySelector('#lysboksMain').classList.remove('hide');
        scrollMiniatyrBilder(i);
    }

    // Scroll så miniatyrbildet til det aktive bildet er så nær midten som mulig
    function scrollMiniatyrBilder(i){
        let miniatyrBilder = document.querySelector('#miniatyrBilder'),
            miniatyrBilde = document.querySelectorAll('.miniatyrBilde')[i],
            center = window.innerWidth / 2,
            parent = miniatyrBilder.getBoundingClientRect(),
            child = miniatyrBilde.getBoundingClientRect(),
            childOffset = parent.left - child.left,
            offset = child.width / 2,
            calculatedOffset = (childOffset + center - offset);

        miniatyrBilder.style.transitionDuration = props.hastighet + 'ms';
        miniatyrBilde.style.transitionDuration = props.hastighet + 'ms';

        if (miniatyrBilder.scrollWidth > window.innerWidth){
            if (calculatedOffset > 0){
                miniatyrBilder.style.left = '0px';
            } else if (calculatedOffset - window.innerWidth + miniatyrBilder.scrollWidth < 0) {
                miniatyrBilder.style.left = "calc(" + ( - miniatyrBilder.scrollWidth + window.innerWidth) + 'px - .5vh)';
            } else {
                miniatyrBilder.style.left = calculatedOffset + 'px';
            }
        }
        document.querySelectorAll('.miniatyrBilde').forEach(bilde => {
            if (bilde.dataset.target == i){
                bilde.classList.add('selected');
            } else {
                bilde.classList.remove('selected');
            }
        });
    }

    // Sett aktivt lysbilde
    function changeCurrentLysbildeData(i){
        document.querySelector('#lysboksBilde img').setAttribute('src', bilder[i].stor);
        document.querySelector('#lysboksBilde img').setAttribute('title', bilder[i].title);
        document.querySelector('#lysboksTooltip').innerText = bilder[i].title;
        if (i === 0) {
            document.querySelector('#lysboksLeft').dataset.target = null;
        } else {
            document.querySelector('#lysboksLeft').dataset.target = (i - 1);
        }
        if (i >= bilder.length - 1) {
            document.querySelector('#lysboksRight').dataset.target = null;
        } else {
            document.querySelector('#lysboksRight').dataset.target = (i + 1);
        }
    }

    // Fjern rullefeltet til body mens lysboksen er åpen
    function skjulRullefelt(removed) {
        if (removed === true) {
            body.style.overflow = 'hidden';
            body.style.marginRight = bodyMarginRight + scrollBarWidth + "px";
        } else {
            body.style.overflow = bodyOverflow;
            body.style.marginRight = bodyMarginRight + "px";
        }
    }

    // Sjekk om lenken faktisk går til et bilde. Basert på denne løsningen: https://stackoverflow.com/questions/9714525/javascript-image-url-verify/68333175#68333175
    function doesImageExist(el){
        return new Promise((resolve) => {
            const img = new Image();
            img.src = el.getAttribute('href');
            img.onload = () => resolve({
                'element':el,
                'isImage': true
            });
            img.onerror = () => resolve({
                'element':el,
                'isImage': false
            });
        });
    };
}