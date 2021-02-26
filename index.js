/* eslint-disable indent */
const Discord = require('discord.js');
const fetch = require('node-fetch');
// const Canvas = require('canvas');
require('dotenv').config();

const client = new Discord.Client();

client.once('ready', async () => {
    console.log('Ready!');
});

client.on('message', async (msg) => {
    msg.content = msg.content.trim();
    const virusFlag = '!covid';

    if (msg.content.startsWith(virusFlag)) {

        // if the !covid command has a plus space (e.g. !covid infected)
        const command = msg.content.slice(virusFlag.length + 1, msg.content.length);

        switch (command) {
            case '': {
                msg.channel.send(`Megadott utasításokkal lekérhetőek az éppen aktuális koronavírus adatok.\nUtasítások listájához használja a __**${virusFlag} help**__ parancsot.`);
                break;
            }
            case 'help': {
                // (a frissítés idejét is kiírja, mivel lehet, hogy a mai nap adatai még nem elérhetőek)
                const commands = `Koronavírus parancsok:
                    * __**${virusFlag}**__: ismertető.
                    * __**${virusFlag} site**__: koronavírus adatokat részletező weboldalam.
                    * __**${virusFlag} infected today**__: mai új fertőzöttek a száma.
                    * __**${virusFlag} infected**__: azon emberek száma akik eddig elkapták a vírust.
                    * __**${virusFlag} tested today**__: mai napon elvégzett mintavételek.
                    * __**${virusFlag} tested**__: eddigi mintavételek összesen.
                    * __**${virusFlag} deceased today**__: mai napi halálozások.
                    * __**${virusFlag} deceased**__: összes halálozások száma.
                    * __**${virusFlag} quarantined**__: karanténban levők száma.
                    * __**${virusFlag} recovered**__: gyógyultak száma.
                    * __**${virusFlag} active**__: jelenleg fertőzöttek száma.
                    * __**${virusFlag} all**__: bővebb leírás az aktuális adatokról.
                `;
                msg.channel.send(commands.replace(/ +(?= )/g, '\t'));
                break;
            }
            case 'site': {
                msg.channel.send('Több koronavírussal kapcsolatos részletekért látogasd meg a weboldalam:\nhttps://hungarycovid.vercel.app');
                break;
            }
            case 'infected today': {
                const covidDatas = await getCovidDatas();
                msg.channel.send(`(${formatDate(covidDatas.lastUpdateInHungary)})\nMai új fertőzöttek Magyarországon: ${formatNumber(covidDatas.covid.infectedToday)} Fő`);
                break;
            }
            case 'infected': {
                const covidDatas = await getCovidDatas();
                msg.channel.send(`(${formatDate(covidDatas.lastUpdateInHungary)})\nFertőzöttek Magyarországon: ${formatNumber(covidDatas.covid.infected)} Fő`);
                break;
            }
            case 'tested today': {
                const covidDatas = await getCovidDatas();
                msg.channel.send(`(${formatDate(covidDatas.lastUpdateInHungary)})\nMai napon teszteltek száma Magyarországon: ${formatNumber(covidDatas.covid.testedToday)} fő`);
                break;
            }
            case 'tested': {
                const covidDatas = await getCovidDatas();
                msg.channel.send(`(${formatDate(covidDatas.lastUpdateInHungary)})\nÖsszesn teszteltek száma Magyarországon: ${formatNumber(covidDatas.covid.tested)} fő`);
                break;
            }
            case 'deceased today': {
                const covidDatas = await getCovidDatas();
                msg.channel.send(`(${formatDate(covidDatas.lastUpdateInHungary)})\nMai halálozások Magyarországon: ${formatNumber(covidDatas.covid.deceasedToday)} fő`);
                break;
            }
            case 'deceased': {
                const covidDatas = await getCovidDatas();
                msg.channel.send(`(${formatDate(covidDatas.lastUpdateInHungary)})\nÖsszes halálozások száma Magyarországon: ${formatNumber(covidDatas.covid.deceased)} fő`);
                break;
            }
            case 'quarantined': {
                const covidDatas = await getCovidDatas();
                msg.channel.send(`(${formatDate(covidDatas.lastUpdateInHungary)})\nKaranténban levők száma Magyarországon: ${formatNumber(covidDatas.covid.quarantined)} fő`);
                break;
            }
            case 'recovered': {
                const covidDatas = await getCovidDatas();
                msg.channel.send(`(${formatDate(covidDatas.lastUpdateInHungary)})\nGyógyultak száma Magyarországon: ${formatNumber(covidDatas.covid.recovered)} fő`);
                break;
            }
            case 'active': {
                const covidDatas = await getCovidDatas();
                msg.channel.send(`(${formatDate(covidDatas.lastUpdateInHungary)})\nAktív fertőzöttek Magyarországon: ${formatNumber(covidDatas.covid.activeInfected)} Fő`);
                break;
            }
            case 'all': {
                const covidDatas = await getCovidDatas();
                const { infectedToday, infected, testedToday, tested, deceasedToday, deceased, quarantined, recovered, activeInfected } = covidDatas.covid;
                const { lastUpdateInHungary } = covidDatas;
                // console.log('infectedToday', infectedToday, 'infected', infected, 'testedToday', testedToday, 'tested', tested, 'deceasedToday', deceasedToday, 'deceased', deceased, 'quarantined', quarantined, 'recovered', recovered, 'activeInfected', activeInfected);
                msg.channel.send(`A mai napon (${formatDate(lastUpdateInHungary)}) újabb ${formatNumber(infectedToday)} beteget azonosítottak Magyarországon, így a fertőzöttek száma ${formatNumber(infected)} főre, míg az aktív betegek száma ${formatNumber(activeInfected)} főre változott és újabb ${formatNumber(deceasedToday)} ember vesztette életét, mellyel eddig összesen ${formatNumber(deceased)} áldozatot követelt a vírus. Továbbá a mai napon ${formatNumber(testedToday)} mintavételre került sor és ezzel eddig összesen ${formatNumber(tested)} ember lett tesztelve. A gyógyultak száma jelenleg ${formatNumber(recovered)} főre nött, illetve ${formatNumber(quarantined)} fő van hatósági házi karanténban.`);
                break;
            }
            default: {
                msg.channel.send(`Az Ön által kért parancs nem található! A parancsok listázásához használja a következőt: ${virusFlag} help`);
                break;
            }
        }
    }

});

const getCovidDatas = async () => {
    const response = await fetch(process.env.API_URL);
    const result = await response.json();

    const todayVirusDatas = result.reverse()[0];

    return todayVirusDatas;
};

const formatNumber = (number) => {
    return new Intl.NumberFormat('hu-HU').format(number);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('hu-HU');
};

client.login(process.env.BOT_TOKEN);