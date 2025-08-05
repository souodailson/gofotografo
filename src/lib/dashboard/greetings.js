export const getGreeting = (userName) => {
  const currentHour = new Date().getHours();
  const namePart = userName ? `, ${userName}` : '';

  const morningGreetings = [
    `Bom dia${namePart}! Hora de brilhar.`,
    `Um café e um plano, ${userName || 'bora'}?`,
    `Que a sua criatividade floresça hoje${namePart}!`,
    `Bom dia! Vamos fazer mágica acontecer hoje?`,
  ];

  const afternoonGreetings = [
    `Boa tarde${namePart}! Como vai a produção?`,
    `Continue com o ótimo trabalho${namePart}!`,
    `Boa tarde! Uma pausa para o café e seguimos.`,
    `Hora de criar algo incrível nesta tarde${namePart}!`,
  ];

  const nightGreetings = [
    `Boa noite${namePart}! Finalizando o dia com sucesso?`,
    `Bom descanso, ${userName || 'guerreiro(a)'}! Você merece.`,
    `Boa noite! As melhores ideias surgem sob as estrelas.`,
    `Hora de recarregar as energias para amanhã${namePart}!`,
  ];

  const getRandomGreeting = (greetings) => greetings[Math.floor(Math.random() * greetings.length)];

  if (currentHour >= 5 && currentHour < 12) {
    return getRandomGreeting(morningGreetings);
  } else if (currentHour >= 12 && currentHour < 18) {
    return getRandomGreeting(afternoonGreetings);
  } else {
    return getRandomGreeting(nightGreetings);
  }
};