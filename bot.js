const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const HIGHLIGHTLY_API_KEY = process.env.HIGHLIGHTLY_API_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const announcedGoals = new Set();

const teamFlags = {
  // Group A
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'Korea Republic': '🇰🇷', 'Czechia': '🇨🇿',
  // Group B
  'Canada': '🇨🇦', 'Bosnia and Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Switzerland': '🇨🇭',
  // Group C
  'Brazil': '🇧🇷', 'Colombia': '🇨🇴', 'Côte d\'Ivoire': '🇨🇮', 'Tunisia': '🇹🇳',
  // Group D
  'USA': '🇺🇸', 'United States': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Türkiye': '🇹🇷', 'Turkey': '🇹🇷',
  // Group E
  'Spain': '🇪🇸', 'Morocco': '🇲🇦', 'Japan': '🇯🇵', 'Haiti': '🇭🇹',
  // Group F
  'France': '🇫🇷', 'Algeria': '🇩🇿', 'Argentina': '🇦🇷', 'Jordan': '🇯🇴',
  // Group G
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Senegal': '🇸🇳', 'Netherlands': '🇳🇱', 'Curaçao': '🇨🇼',
  // Group H
  'Portugal': '🇵🇹', 'DR Congo': '🇨🇩', 'Uzbekistan': '🇺🇿', 'Colombia': '🇨🇴',
  // Group I
  'Germany': '🇩🇪', 'Saudi Arabia': '🇸🇦', 'Belgium': '🇧🇪', 'Cabo Verde': '🇨🇻',
  // Group J
  'Argentina': '🇦🇷', 'Ghana': '🇬🇭', 'Ecuador': '🇪🇨', 'Curaçao': '🇨🇼',
  // Group K
  'Uruguay': '🇺🇾', 'Iraq': '🇮🇶', 'Panama': '🇵🇦', 'Egypt': '🇪🇬',
  // Group L
  'Croatia': '🇭🇷', 'Iran': '🇮🇷', 'Norway': '🇳🇴', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  // Others
  'Sweden': '🇸🇪', 'Austria': '🇦🇹', 'Serbia': '🇷🇸', 'New Zealand': '🇳🇿',
  'Ghana': '🇬🇭', 'Tunisia': '🇹🇳', 'South Korea': '🇰🇷', 'Senegal': '🇸🇳',
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

client.login(DISCORD_TOKEN);    );
    console.log('Live matches found:', res.data.matches.length);
    console.log('Goals in match:', JSON.stringify(res.data.matches[0]?.goals));

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
  console.log('CHANNEL ID IN USE:', process.env.CHANNEL_ID);

  setInterval(checkForGoals, 30000);
});

client.login(DISCORD_TOKEN);

// redeploy fix
