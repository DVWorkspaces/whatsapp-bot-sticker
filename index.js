const FfmpegPath = require('@ffmpeg-installer/ffmpeg');
const WAWebJS = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Spinnies = require('spinnies');
const { exec } = require('child_process');
const moment = require('moment-timezone');

// atur moment ke indonesia
moment.locale('id');

const spinnies = new Spinnies();
const ffmpegPath = FfmpegPath.path;
const { Client, LocalAuth } = WAWebJS;

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "one",
    dataPath: "./sessions",
  }),
  ffmpegPath,
  puppeteer: {
		args: ['--no-sandbox']
	}
});

console.log('Simple WhatsApp Bot Sticker by picasso09');

// Init Bot
client.initialize();

spinnies.add('Connecting', { text: 'Opening Whatsapp Web' })

client.on('loading_screen', (percent, message) => {
  // console.log('', percent, message);
  spinnies.update('Connecting', { text: `Connecting. ${message} ${percent}%`});
});

// On Login
client.on('qr', (qr) => {
  spinnies.add('generateQr', {text: 'Generating QR Code'});
  console.log('[!] Scan QR Code Bellow');
  qrcode.generate(qr, {small: true});
  spinnies.succeed('generateQr', {text: 'QR Code Generated'});
  spinnies.update('Connecting', { text: 'Waiting to scan' })
});

// Authenticated
client.on('authenticated', () => {
  console.log(`✓ Authenticated!                          `)
});

// Auth Failure
client.on('auth_failure', (msg) => {
  console.error('Authentication Failure!', msg);
});

// Bot Ready
client.on('ready', () => {
  spinnies.succeed('Connecting', { text: 'Connected!', successColor: 'greenBright' });
  aboutClient(client);
  console.log('Incoming Messages : \n');
});

// Messages Handler
client.on('message_create', async (msg) => {
  const chat = await msg.getChat();
  const contact = await msg.getContact();
  const timezone = 'Asia/Jakarta';
  const jam = moment().tz(timezone).format('dddd DD-MM-YYYY HH:mm:ss');
  console.log(`💬 ${contact.pushname} : ${msg.body}\n`);

  try {
    switch (msg.body.toLowerCase()) {
      case '.stiker':
      case '.sticker':
      case '.s':
      case '.tikel':
        if(msg.hasMedia){
          const media = await msg.downloadMedia();
          chat.sendMessage(media,
            {
              sendMediaAsSticker: true,
              stickerName: 'github.com/picasso09',
              stickerAuthor: `DVWORKSPACE-${jam}`
            }
          );
          console.log(`💬 ${contact.pushname} : Sticker sent!\n`);
        } else {
          msg.reply('Send image with caption .sticker');
        };
        break;
      case '.neofetch': // fitur neofetch
        exec('neofetch --stdout', (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            chat.sendMessage(`Error executing neofetch: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`);
            chat.sendMessage(`Error: ${stderr}`);
            return;
          }
          chat.sendMessage(`${stdout}`); // Mengirimkan hasil neofetch dengan format kode
        });
        break;
    }
  } catch (error) {
    console.error(error);
  };
});

// Disconnected
client.on('disconnected', (reason) => {
  console.log('Client was logged out, Reason : ', reason);
});

function aboutClient(client){
  console.log(                                                                                                                                               
    '\nAbout Client :' +                                                                                                                                     
    '\n  - Username : ' + client.info.pushname +                                                                                                           
    '\n  - Phone    : ' + client.info.wid.user +                                                                                                       
    '\n  - Platform : ' + client.info.platform + '\n'
  );
};