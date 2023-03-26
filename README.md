# Eremitt lysboks

Eremitt lysboks er en enkel, ren lysboks til bruk i Eremitts prosjekter.

## Krav

Noenlunde moderne nettleser.

## Funksjonalitet

Dette skripet tar alle bilder med link (alt som har formen <a><img></a>) og gjør sånn at linken åpnes i en lysboks istedenfor et nytt vindu.

## Installasjon

- Last ned jquery.lysboks.min.js eller jquery.lysboks.js til hvor enn du har alle skriptene dine og jquery.lysboks.min.css eller jquery.lysboks.css til hvor enn du har stilarkene dine.

- Referer til dem i headeren din

        <script src="lysboks.min.js"></script>
        <link rel="stylesheet" href="lysboks.css">


- Legg dette på siden din et sted

        <script>
            lysboks();
        </script>

- Sett parameterene til hva enn du trenger at de skal være.

- Rak inn pengene!

## Parametere

Det er foreløpig tre parametere som kan settes.

### Beholder

Settes til en css-selektor til et element som inneholder bildene lysboksen skal virke på.

### Hastighet

Hastigheten på animasjonene i millisekunder.

### Lukk

Viser en lukk-knapp. Valgmulighetene er "ingen", bilde" eller "utenfor".

![ingen](https://github.com/Ornendil/lysboks/blob/master/img/ingen.png)
![bilde](https://github.com/Ornendil/lysboks/blob/master/img/bilde.png)
![utenfor](https://github.com/Ornendil/lysboks/blob/master/img/utenfor.png)

### Standardparametere

    lysboks({
        "beholder": ".bildegalleri",
        "hastighet": 200,
        "lukk": "ingen"
    });