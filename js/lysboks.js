function lysboks(properties) {
    "use strict";
    document.addEventListener("DOMContentLoaded", function() {
        if (properties === undefined) {
            properties = {};
            properties.beholder = ".bildegalleri";
            properties.hastighet = 200;
            properties.lukk = "ingen"
        }
        if (properties.beholder === undefined) {
            properties.beholder = ".bildegalleri";
        }
        if (properties.hastighet === undefined) {
            properties.hastighet = 200;
        }
        if (properties.lukk === undefined) {
            properties.lukk = "ingen"
        }

        function outerWidth(el) {
            const style = getComputedStyle(el);

            return (
                el.getBoundingClientRect().width +
                parseFloat(style.marginLeft) +
                parseFloat(style.marginRight)
            );
        }

        //Variabler som brukes i lysboksen
        let body = document.body,
            bodyOverflow = getComputedStyle(body)["overflow"],
            bodyMarginRight = parseInt(getComputedStyle(body)["marginRight"].replace('px','')),
            scrollBarWidth = (window.innerWidth - document.documentElement.clientWidth),
            bilder = [];

        // Lag en array med alle bildene
        document.querySelectorAll(properties.beholder + ' a:has(>img)').forEach(function (el, i) {
            if (checkURL(el.getAttribute('href'))) {
                const title = el.querySelector('img').getAttribute("title");
                bilder.push({
                    "stor": el.getAttribute("href"),
                    "liten": el.querySelector('img').getAttribute("src"),
                    "litenH": el.querySelector('img').getBoundingClientRect().height,
                    "litenW": el.querySelector('img').getBoundingClientRect().width,
                    ... title == null ? { title: '' } : {title: title},
                });
                el.setAttribute("id", "bilde" + i);
            }
            el.addEventListener("click", function (event) {
                if (checkURL(el.getAttribute('href'))) {
                    event.preventDefault();
                    var i = parseInt(el.getAttribute("id").match(/\d+/)[0], 10);

                    changeLysboksBilde(i);


                    document.querySelector('#lysboks').classList.replace('hide', 'show');
        
                    // Fjern rullefeltet til body mens lysboksen er åpen
                    body.style.overflow = 'hidden';
                    body.style.marginRight = bodyMarginRight + scrollBarWidth + "px";
                }
            });
        });
        
        // Legg til lysboksen

        let lysboksHTML = `
        <div id="lysboks" class="hide" style="transition-duration:` + properties.hastighet + `ms">
            <div id="lysboksMain">
                <div id="lysboksBildeWrapper">
                    <div id="lysboksLeft"><svg viewBox="0 0 350 500" fill="#000000"><polygon points="350,100 250,0 0,250 250,500 350,400 200,250"></polygon></svg></div>
                    <div id="lysboksBilde"><img></div>
                    <div id="lysboksRight"><svg viewBox="0 0 350 500" fill="#000000"><polygon points="0,100 100,0 350,250 100,500 0,400 150,250"/></svg></div>
                </div>
                <div id="lysboksTooltip"></div>
            </div>
            <div id="miniatyrBilder">
        `;
        for (let y = 0; y < bilder.length; y++) {
            lysboksHTML += `
                <div data-target="` + y + `" data-bilde="` + bilder[y].stor + `" class="miniatyrBilde" id="miniatyrBilde` + y + `">
                    <img src="` + bilder[y].liten + `" title="` + bilder[y].title + `">
                </div>
        `;
        }

        lysboksHTML += `
            </div>
        </div>
        `;
        let lysDiv = document.createElement('div');
        body.appendChild(lysDiv);
        lysDiv.outerHTML = lysboksHTML;


        // Lag en lukk-knapp
        let lysboksLukkKnapp = document.createElement('div');
        lysboksLukkKnapp.setAttribute('id', 'lysboksLukk');
        lysboksLukkKnapp.innerHTML = '<svg viewBox="0 0 500 500"><polygon points="0,100 100,0 250,150 400,0 500,100 350,250 500,400 400,500 250,350 100,500 0,400 150,250"/>';
        
        // Sett lukk-knappen inn der du vil ha den
        if (properties.lukk === "bilde") {
            document.querySelector('#lysboksBilde').appendChild(lysboksLukkKnapp);
        } else if (properties.lukk === "utenfor") {
            document.querySelector('#lysboks').appendChild(lysboksLukkKnapp);
        }
        // Lukk lysboksen
        document.querySelectorAll("#lysboks, #lysboksLukk").forEach(closer => {
            closer.addEventListener('click', function (event) {
                if (event.currentTarget !== event.target) {
                    return;
                }
                document.querySelector('#lysboks').classList.replace('show', 'hide');

                // Her setter du tilbake rullefeltet til body
                body.style.overflow = bodyOverflow;
                body.style.marginRight = bodyMarginRight + "px";
            }, false);
        });

        function changeLysboksBilde(i) {

            changeCurrentLysbildeData(i);

            document.querySelector('#lysboksMain').style.transitionDuration = properties.hastighet + 'ms';
            document.querySelector('#lysboksMain').classList.remove('hide');

            scrollMiniatyrBilder(i);


        }

        function scrollMiniatyrBilder(i){

            let miniatyrBilder = document.querySelector('#miniatyrBilder');
            let miniatyrBilde = document.querySelectorAll('.miniatyrBilde')[i];

            miniatyrBilder.style.transitionDuration = properties.hastighet + 'ms';
            miniatyrBilde.style.transitionDuration = properties.hastighet + 'ms';

            let center = window.innerWidth / 2;
            let parent = miniatyrBilder.getBoundingClientRect();
            let child = miniatyrBilde.getBoundingClientRect();
            let childOffset = parent.left - child.left;
            let offset = child.width / 2;

            let calculatedOffset = (childOffset + center - offset);

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
                    bilde.style.opacity = "0.3";
                } else {
                    bilde.style.opacity = "1";
                }
            });
        }

        function changeCurrentLysbildeData(i){

            // Change data of current image
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

        // Bytt bilde ved å trykke på en av miniatyrbildene eller venstre- eller høyre-knappene
        document.querySelectorAll('.miniatyrBilde, #lysboksLeft, #lysboksRight').forEach(changer => {
            changer.addEventListener("click", function (event) {
                let w = parseInt(changer.dataset.target);

                document.querySelector('#lysboksMain').style.transitionDuration = properties.hastighet / 2 + 'ms';
                document.querySelector('#lysboksMain').classList.add('hide');
        
                setTimeout(function () {
                    changeLysboksBilde(w);
                }, properties.hastighet / 2);
            });
        });

        // http://stackoverflow.com/questions/9714525/javascript-image-url-verify
        function checkURL(url) {
            return (url.match(/\.(jpeg|jpg|gif|png)$/) !== null);
        }
    });
}