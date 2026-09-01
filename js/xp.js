export function getRank(xp){if(xp>=2500)return 'GEI ARCHITECT';if(xp>=1500)return 'KNOWLEDGE ENGINEER';if(xp>=900)return 'INVESTIGATOR';if(xp>=500)return 'PATTERN HUNTER';if(xp>=250)return 'QUESTIONER';return 'OBSERVER';}
export function getNextXP(xp){if(xp<250)return 250;if(xp<500)return 500;if(xp<900)return 900;if(xp<1500)return 1500;if(xp<2500)return 2500;return null;}
