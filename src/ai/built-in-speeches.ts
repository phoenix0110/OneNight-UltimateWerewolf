import { RoleId } from '@/engine/roles';

export interface BuiltInSpeech {
  id: string;
  template: string; // use {player} for player name placeholder, {role} for role
  category: 'claim' | 'accuse' | 'defend' | 'generic';
}

// ─── English Speeches ────────────────────────────────────────────────

const ROLE_SPEECHES_EN: Record<RoleId, BuiltInSpeech[]> = {
  werewolf: [
    { id: 'ww_claim_villager', template: "I'm a Villager, nothing happened to me last night.", category: 'claim' },
    { id: 'ww_claim_seer', template: "I'm the Seer. I checked {player} and they're a Werewolf.", category: 'claim' },
    { id: 'ww_accuse', template: "I think {player} is acting really suspicious.", category: 'accuse' },
    { id: 'ww_deflect', template: "Why is everyone looking at me? I'm just a villager.", category: 'defend' },
    { id: 'ww_pressure', template: "{player}, what's your role? You've been awfully quiet.", category: 'accuse' },
  ],
  seer: [
    { id: 'seer_reveal_player', template: "I'm the Seer. I checked {player} — they're the {role}.", category: 'claim' },
    { id: 'seer_reveal_center', template: "I'm the Seer. I looked at two center cards and saw {role}.", category: 'claim' },
    { id: 'seer_accuse', template: "Based on what I saw, {player} is definitely suspicious.", category: 'accuse' },
    { id: 'seer_trust', template: "I can confirm {player} is safe.", category: 'defend' },
  ],
  robber: [
    { id: 'rob_reveal', template: "I'm the Robber. I swapped with {player} and I'm now the {role}.", category: 'claim' },
    { id: 'rob_hide', template: "I didn't do anything special last night.", category: 'claim' },
    { id: 'rob_accuse', template: "I know what {player} was — they should be worried.", category: 'accuse' },
    { id: 'rob_safe', template: "I can vouch for myself. I swapped and I know I'm village team.", category: 'defend' },
  ],
  troublemaker: [
    { id: 'tm_reveal', template: "I'm the Troublemaker. I swapped {player} and {player}.", category: 'claim' },
    { id: 'tm_warn', template: "Careful — some of you might not be who you think you are.", category: 'generic' },
    { id: 'tm_hide', template: "I'm just a regular villager, nothing to report.", category: 'claim' },
    { id: 'tm_accuse', template: "I swapped cards around. {player}, you might want to rethink your claim.", category: 'accuse' },
  ],
  villager: [
    { id: 'vil_claim', template: "I'm a Villager. I've got nothing from last night.", category: 'claim' },
    { id: 'vil_listen', template: "Let's hear from everyone before we decide.", category: 'generic' },
    { id: 'vil_suspect', template: "I don't trust {player}. Something feels off.", category: 'accuse' },
    { id: 'vil_defend', template: "I'm just a villager, no reason to suspect me.", category: 'defend' },
    { id: 'vil_vote', template: "I'm voting for {player}. Who's with me?", category: 'accuse' },
  ],
  insomniac: [
    { id: 'ins_same', template: "I'm the Insomniac. I checked my card — I'm still the Insomniac.", category: 'claim' },
    { id: 'ins_changed', template: "I'm the Insomniac and my role changed! Someone swapped me.", category: 'claim' },
    { id: 'ins_accuse', template: "Someone messed with my card. {player}, was that you?", category: 'accuse' },
    { id: 'ins_confirm', template: "Nobody touched my card, so I can confirm the Troublemaker didn't swap me.", category: 'defend' },
  ],
  drunk: [
    { id: 'drk_claim', template: "I'm the Drunk. I swapped with a center card but I don't know what I am now.", category: 'claim' },
    { id: 'drk_worry', template: "I might be a Werewolf now for all I know...", category: 'generic' },
    { id: 'drk_accuse', template: "Since I don't know my role, let's focus on {player}.", category: 'accuse' },
  ],
  hunter: [
    { id: 'hnt_warn', template: "I'm the Hunter. If you vote me out, whoever I'm pointing at dies too.", category: 'claim' },
    { id: 'hnt_target', template: "Just so everyone knows, I'm aiming at {player}.", category: 'accuse' },
    { id: 'hnt_defend', template: "Killing me is risky — think carefully about who I'll take down.", category: 'defend' },
  ],
  tanner: [
    { id: 'tan_fake_ww', template: "Fine, I'll admit it... I'm the Werewolf.", category: 'claim' },
    { id: 'tan_sus', template: "I've been caught, haven't I? Go ahead, vote for me.", category: 'defend' },
    { id: 'tan_deflect', template: "Actually, {player} is way more suspicious than me.", category: 'accuse' },
  ],
  minion: [
    { id: 'min_claim', template: "I'm a Villager. Let's find those werewolves!", category: 'claim' },
    { id: 'min_protect', template: "I think {player} is innocent. We should look elsewhere.", category: 'defend' },
    { id: 'min_redirect', template: "Has anyone considered that {player} might be the real threat?", category: 'accuse' },
  ],
  mason: [
    { id: 'msn_claim', template: "I'm a Mason. I can confirm {player} is the other Mason.", category: 'claim' },
    { id: 'msn_solo', template: "I'm a Mason but I didn't see another Mason. One must be in the center.", category: 'claim' },
    { id: 'msn_vouch', template: "I can vouch for {player} — we're both Masons.", category: 'defend' },
  ],
  doppelganger: [
    { id: 'dop_claim', template: "I copied someone's role last night. I'm now acting as {role}.", category: 'claim' },
    { id: 'dop_hide', template: "I'm just a regular villager.", category: 'claim' },
    { id: 'dop_accuse', template: "I know what {player} started as. They should explain themselves.", category: 'accuse' },
  ],
};

const UNIVERSAL_SPEECHES_EN: BuiltInSpeech[] = [
  { id: 'uni_who_ww', template: "Who do you think the werewolves are?", category: 'generic' },
  { id: 'uni_quiet', template: "{player}, you're being really quiet. What's your role?", category: 'accuse' },
  { id: 'uni_vote_call', template: "I think we should vote for {player}.", category: 'accuse' },
  { id: 'uni_no_kill', template: "Maybe nobody is a werewolf. Should we all vote for the same person to spread votes?", category: 'generic' },
];

// ─── Chinese Speeches ────────────────────────────────────────────────

const ROLE_SPEECHES_ZH: Record<RoleId, BuiltInSpeech[]> = {
  werewolf: [
    { id: 'ww_claim_villager', template: '我是村民，昨晚什么都没发生。', category: 'claim' },
    { id: 'ww_claim_seer', template: '我是预言家。我验了{player}，是狼人。', category: 'claim' },
    { id: 'ww_accuse', template: '我觉得{player}非常可疑。', category: 'accuse' },
    { id: 'ww_deflect', template: '为什么大家都在看我？我只是个村民啊。', category: 'defend' },
    { id: 'ww_pressure', template: '{player}，你是什么身份？你一直没说话啊。', category: 'accuse' },
  ],
  seer: [
    { id: 'seer_reveal_player', template: '我是预言家。我验了{player}，他是{role}。', category: 'claim' },
    { id: 'seer_reveal_center', template: '我是预言家。我看了两张底牌，看到了{role}。', category: 'claim' },
    { id: 'seer_accuse', template: '根据我看到的信息，{player}绝对有问题。', category: 'accuse' },
    { id: 'seer_trust', template: '我可以确认{player}是安全的。', category: 'defend' },
  ],
  robber: [
    { id: 'rob_reveal', template: '我是强盗。我和{player}换了牌，我现在是{role}。', category: 'claim' },
    { id: 'rob_hide', template: '我昨晚没什么特别的操作。', category: 'claim' },
    { id: 'rob_accuse', template: '我知道{player}之前是什么身份——他该紧张了。', category: 'accuse' },
    { id: 'rob_safe', template: '我可以为自己担保。我换了牌，我知道我是好人阵营。', category: 'defend' },
  ],
  troublemaker: [
    { id: 'tm_reveal', template: '我是捣蛋鬼。我交换了{player}和{player}的牌。', category: 'claim' },
    { id: 'tm_warn', template: '小心——你们中有些人可能已经不是原来的身份了。', category: 'generic' },
    { id: 'tm_hide', template: '我只是普通村民，没什么好汇报的。', category: 'claim' },
    { id: 'tm_accuse', template: '我交换了牌。{player}，你可能需要重新想想你的说辞了。', category: 'accuse' },
  ],
  villager: [
    { id: 'vil_claim', template: '我是村民，昨晚没有任何信息。', category: 'claim' },
    { id: 'vil_listen', template: '我们先听听每个人怎么说再做决定吧。', category: 'generic' },
    { id: 'vil_suspect', template: '我不太信任{player}，总觉得哪里不对。', category: 'accuse' },
    { id: 'vil_defend', template: '我只是个村民，没有理由怀疑我。', category: 'defend' },
    { id: 'vil_vote', template: '我要投{player}。谁跟我一起？', category: 'accuse' },
  ],
  insomniac: [
    { id: 'ins_same', template: '我是失眠者。我检查了我的牌——还是失眠者。', category: 'claim' },
    { id: 'ins_changed', template: '我是失眠者，我的身份变了！有人换了我的牌。', category: 'claim' },
    { id: 'ins_accuse', template: '有人动了我的牌。{player}，是你干的吗？', category: 'accuse' },
    { id: 'ins_confirm', template: '没人动我的牌，所以捣蛋鬼没有换我。', category: 'defend' },
  ],
  drunk: [
    { id: 'drk_claim', template: '我是酒鬼。我和一张底牌换了，但我不知道我现在是什么。', category: 'claim' },
    { id: 'drk_worry', template: '说不定我现在已经变成狼人了……', category: 'generic' },
    { id: 'drk_accuse', template: '既然我不知道自己的身份，我们先关注{player}吧。', category: 'accuse' },
  ],
  hunter: [
    { id: 'hnt_warn', template: '我是猎人。如果你们投死我，我指的那个人也会跟着死。', category: 'claim' },
    { id: 'hnt_target', template: '提醒大家，我现在瞄准的是{player}。', category: 'accuse' },
    { id: 'hnt_defend', template: '杀我的代价很大——想清楚我会带走谁。', category: 'defend' },
  ],
  tanner: [
    { id: 'tan_fake_ww', template: '好吧，我承认……我是狼人。', category: 'claim' },
    { id: 'tan_sus', template: '我被抓到了，对吧？来吧，投我。', category: 'defend' },
    { id: 'tan_deflect', template: '其实{player}比我可疑多了。', category: 'accuse' },
  ],
  minion: [
    { id: 'min_claim', template: '我是村民。大家一起找出狼人吧！', category: 'claim' },
    { id: 'min_protect', template: '我觉得{player}是无辜的，我们应该看看别人。', category: 'defend' },
    { id: 'min_redirect', template: '有没有人想过{player}才是真正的威胁？', category: 'accuse' },
  ],
  mason: [
    { id: 'msn_claim', template: '我是共济会。我可以确认{player}是另一个共济会。', category: 'claim' },
    { id: 'msn_solo', template: '我是共济会，但我没看到另一个共济会。另一张应该在底牌里。', category: 'claim' },
    { id: 'msn_vouch', template: '我可以为{player}担保——我们都是共济会。', category: 'defend' },
  ],
  doppelganger: [
    { id: 'dop_claim', template: '我昨晚复制了一个人的身份，我现在是{role}。', category: 'claim' },
    { id: 'dop_hide', template: '我只是普通村民。', category: 'claim' },
    { id: 'dop_accuse', template: '我知道{player}最初是什么身份。他应该解释一下。', category: 'accuse' },
  ],
};

const UNIVERSAL_SPEECHES_ZH: BuiltInSpeech[] = [
  { id: 'uni_who_ww', template: '你们觉得谁是狼人？', category: 'generic' },
  { id: 'uni_quiet', template: '{player}，你一直很安静。你是什么身份？', category: 'accuse' },
  { id: 'uni_vote_call', template: '我觉得我们应该投{player}。', category: 'accuse' },
  { id: 'uni_no_kill', template: '也许没有人是狼人。我们要不要分散投票？', category: 'generic' },
];

// ─── Public API ──────────────────────────────────────────────────────

export function getBuiltInSpeeches(role: RoleId, locale: string = 'en'): BuiltInSpeech[] {
  const roleSpeechMap = locale === 'zh' ? ROLE_SPEECHES_ZH : ROLE_SPEECHES_EN;
  const universalSpeeches = locale === 'zh' ? UNIVERSAL_SPEECHES_ZH : UNIVERSAL_SPEECHES_EN;
  return [...(roleSpeechMap[role] || []), ...universalSpeeches];
}

export function fillTemplate(
  template: string,
  playerNames: string[],
  roleName?: string
): string {
  let result = template;
  // Replace {player} placeholders with actual names
  const playerPlaceholders = result.match(/\{player\}/g) || [];
  const shuffled = [...playerNames].sort(() => Math.random() - 0.5);
  playerPlaceholders.forEach((_, i) => {
    result = result.replace('{player}', shuffled[i % shuffled.length]);
  });
  if (roleName) {
    result = result.replace(/\{role\}/g, roleName);
  }
  return result;
}
