const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const announcedGoals = new Set();

const teamFlags = {
  'France': '🇫🇷', 'Brazil': '🇧🇷', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Germany': '🇩🇪', 'Spain': '🇪🇸', 'Argentina': '🇦🇷',
  'Portugal': '🇵🇹', 'Netherlands': '🇳🇱', 'USA': '🇺🇸',
  'Morocco': '🇲🇦', 'Japan': '🇯🇵', 'Australia': '🇦🇺',
  'Mexico': '🇲🇽', 'Colombia': '🇨🇴', 'Uruguay': '🇺🇾',
  'Senegal': '🇸🇳', 'Ghana': '🇬🇭', 'Cameroon': '🇨🇲',
  'South Korea': '🇰🇷', 'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷',
  'Croatia': '🇭🇷', 'Serbia': '🇷🇸', 'Switzerland': '🇨🇭',
  'Belgium': '🇧🇪', 'Denmark': '🇩🇰', 'Poland': '🇵🇱',
  'Ecuador': '🇪🇨', 'Canada': '🇨🇦', 'Qatar': '🇶🇦',
};

async function checkForGoals() {
  try {
    const res = await axios.get(
      'https://api.football-data.org/v4/competitions/WC/matches?status=IN_PLAY',
      { headers: { 'X-Auth-Token': FOOTBALL_API_KEY } }
    );

    for (const match of res.data.matches) {
      for (const goal of match.goals || []) {
        const goalId = `${match.id}-${goal.minute}-${goal.scorer.name}`;
        if (announcedGoals.has(goalId)) continue;
        announcedGoals.add(goalId);

        const flag = teamFlags[goal.team.name] || '🏳️';
        const assist = goal.assist?.name ? `\n🅰️ ${goal.assist.name}` : '';
        const homeScore = match.score.fullTime.home ?? match.score.halfTime.home ?? 0;
        const awayScore = match.score.fullTime.away ?? match.score.halfTime.away ?? 0;

        const message = [
          `⚽ **GOAL! ${match.homeTeam.name} ${homeScore} - ${awayScore} ${match.awayTeam.name}**`,
          ``,
          `${flag} **${goal.scorer.name}**`,
          assist,
          `⏱️ ${goal.minute}'`
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
  setInterval(checkForGoals, 30000);
});

client.login(DISCORD_TOKEN);

