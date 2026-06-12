const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const HIGHLIGHTLY_API_KEY = process.env.HIGHLIGHTLY_API_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const announcedGoals = new Set();

const teamFlags = {
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'Korea Republic': '🇰🇷', 'Czechia': '🇨🇿',
  'Canada': '🇨🇦', 'Bosnia and Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷', 'Colombia': '🇨🇴', 'Côte d\'Ivoire': '🇨🇮', 'Tunisia': '🇹🇳',
  'United States': '🇺🇸', 'USA': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Türkiye': '🇹🇷',
  'Spain': '🇪🇸', 'Morocco': '🇲🇦', 'Japan': '🇯🇵', 'Haiti': '🇭🇹',
  'France': '🇫🇷', 'Algeria': '🇩🇿', 'Argentina': '🇦🇷', 'Jordan': '🇯🇴',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Senegal': '🇸🇳', 'Netherlands': '🇳🇱', 'Curaçao': '🇨🇼',
  'Portugal': '🇵🇹', 'DR Congo': '🇨🇩', 'Uzbekistan': '🇺🇿',
  'Germany': '🇩🇪', 'Saudi Arabia': '🇸🇦', 'Belgium': '🇧🇪', 'Cabo Verde': '🇨🇻',
  'Ghana': '🇬🇭', 'Ecuador': '🇪🇨', 'Uruguay': '🇺🇾', 'Iraq': '🇮🇶',
  'Panama': '🇵🇦', 'Egypt': '🇪🇬', 'Croatia': '🇭🇷', 'Iran': '🇮🇷',
  'Norway': '🇳🇴', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Sweden': '🇸🇪', 'Austria': '🇦🇹',
  'Serbia': '🇷🇸', 'New Zealand': '🇳🇿', 'South Korea': '🇰🇷',
};

async function checkForGoals() {
  try {
    const res = await axios.get(
      'https://football.highlightly.net/matches/live',
      {
        headers: {
          'x-api-key': HIGHLIGHTLY_API_KEY
        }
      }
    );

    console.log('Live matches found:', res.data.data?.length || 0);

    for (const match of res.data.data || []) {
      const events = match.events || [];

      for (const event of events) {
        if (event.type !== 'GOAL') continue;

        const goalId = `${match.id}-${event.minute}-${event.player?.name}`;
        if (announcedGoals.has(goalId)) continue;
        announcedGoals.add(goalId);

        const teamName = event.team?.name || '';
        const flag = teamFlags[teamName] || '🏳️';
        const assist = event.assist?.name ? `\n🅰️ ${event.assist.name}` : '';
        const homeScore = match.homeScore ?? '?';
        const awayScore = match.awayScore ?? '?';

        const message = [
          `⚽ **GOAL! ${match.homeTeam.name} ${homeScore} - ${awayScore} ${match.awayTeam.name}**`,
          ``,
          `${flag} **${event.player?.name}**`,
          assist,
          `⏱️ ${event.minute}'`
        ].filter(Boolean).join('\n');

        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send(message);
      }
    }
  } catch (err) {
    console.error('Error checking for goals:', err.message);
  }
}

client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  console.log('CHANNEL ID IN USE:', CHANNEL_ID);
  setInterval(checkForGoals, 30000);
});

client.login(DISCORD_TOKEN);
