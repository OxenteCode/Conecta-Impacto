import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env
const envContent = fs.readFileSync('.env', 'utf-8');
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getOrCreateUser(email, defaultMetadata, password = '123456') {
  console.log(`Setting up account: ${email}`);
  
  // 1. Tentar cadastro
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: { data: defaultMetadata }
  });

  if (!signUpError && signUpData.user) {
    console.log(`Account ${email} created successfully!`);
    return signUpData.user.id;
  }

  // 2. Se já existe, tentar fazer login com a senha ou com as senhas padrão
  if (signUpError && signUpError.message.includes('already registered')) {
    console.log(`Account ${email} already registered. Trying to log in...`);
    
    // Tentar senha customizada / padrão
    let { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (!loginError && loginData.user) {
      console.log(`Log in successful!`);
      return loginData.user.id;
    }

    // Tentar '123456'
    console.log(`Failed with password. Trying '123456'...`);
    ({ data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: '123456'
    }));

    if (!loginError && loginData.user) {
      console.log(`Log in successful with '123456'!`);
      return loginData.user.id;
    }

    // Tentar 'password123'
    console.log(`Failed with '123456'. Trying 'password123'...`);
    ({ data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'password123'
    }));

    if (!loginError && loginData.user) {
      console.log(`Log in successful with 'password123'!`);
      return loginData.user.id;
    }

    throw new Error(`Could not sign in to existing user ${email}. Details: ${loginError?.message}`);
  }

  throw signUpError;
}

async function logInUser(email, password = '123456') {
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password
  });
  if (error) {
    ({ data, error } = await supabase.auth.signInWithPassword({
      email,
      password: '123456'
    }));
  }
  if (error) {
    ({ data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'password123'
    }));
  }
  if (error) {
    throw new Error(`Failed to log in ${email}: ${error.message}`);
  }
  return data.user.id;
}

async function seed() {
  console.log('=== Starting Showcase Database Seed ===');

  try {
    // 1. Criar ou Obter a ONG "Oxente Code Tech" (conecta@oxentecode.com.br)
    const ongId = await getOrCreateUser('conecta@oxentecode.com.br', {
      nome: 'Lailson Code (Diretor)',
      tipo_usuario: 'ong',
      ong_name: 'Oxente Code Tech'
    });

    // 2. Criar ou Obter o Patrocinador "OxenteCode Tech" (patrocinio@oxentecode.com)
    const sponsorId = await getOrCreateUser('patrocinio@oxentecode.com', {
      nome: 'Lailson Code (Gestor ESG)',
      tipo_usuario: 'doador',
      ong_name: 'OxenteCode Tech',
      cnpj: '12.345.678/0001-90',
      cnpj_valid: true
    });

    // 3. Criar ou Obter o Voluntário "thiago@oxentecode.com.br"
    const volId = await getOrCreateUser('thiago@oxentecode.com.br', {
      nome: 'Thiago Neves (Mentor)',
      tipo_usuario: 'voluntario'
    });

    // 4. Criar ou Obter o Voluntário "mariana@oxentecode.com.br"
    const marianaId = await getOrCreateUser('mariana@oxentecode.com.br', {
      nome: 'Mariana Santos (Dev)',
      tipo_usuario: 'voluntario'
    });

    // 5. Criar ou Obter o Voluntário "felipe@oxentecode.com.br"
    const felipeId = await getOrCreateUser('felipe@oxentecode.com.br', {
      nome: 'Felipe Ramos (Mentor)',
      tipo_usuario: 'voluntario'
    });

    // 6. Criar ou Obter o Voluntário "juliana@oxentecode.com.br"
    const julianaId = await getOrCreateUser('juliana@oxentecode.com.br', {
      nome: 'Juliana Ribeiro (Designer)',
      tipo_usuario: 'voluntario'
    });

    // 7. Criar ou Obter a Voluntária "louiseagnes57@gmail.com"
    const louiseId = await getOrCreateUser('louiseagnes57@gmail.com', {
      nome: 'Louise Agnes (Educadora)',
      tipo_usuario: 'voluntario'
    }, 'q1w2e3r4t5y6');

    console.log('\n--- User IDs Resolved ---');
    console.log(`NGO (conecta@oxentecode.com.br): ${ongId}`);
    console.log(`Sponsor (patrocinio@oxentecode.com): ${sponsorId}`);
    console.log(`Volunteer (thiago@oxentecode.com.br): ${volId}`);
    console.log(`Volunteer (mariana@oxentecode.com.br): ${marianaId}`);
    console.log(`Volunteer (felipe@oxentecode.com.br): ${felipeId}`);
    console.log(`Volunteer (juliana@oxentecode.com.br): ${julianaId}`);
    console.log(`Volunteer (louiseagnes57@gmail.com): ${louiseId}`);
    console.log('-------------------------\n');

    // ── ATUALIZAR PERFIS ENQUANTO LOGADO COMO CADA UM ──────────────────────────
    console.log('Updating profiles in database...');

    // Logado como a ONG para atualizar o perfil dela
    await logInUser('conecta@oxentecode.com.br');
    await supabase.from('profiles').upsert({
      id: ongId,
      tipo_usuario: 'ong',
      nome: 'Lailson Code (Diretor)',
      ong_name: 'Oxente Code Tech',
      cnpj: '98.765.432/0001-10',
      cnpj_valid: true,
      cidade: 'Natal, RN',
      descricao: 'Associação socioeducacional comprometida em democratizar o acesso à tecnologia e acelerar o potencial de jovens da periferia do RN por meio da educação digital e mentoria prática em desenvolvimento de software.',
      missao: 'Utilizar a tecnologia como ferramenta de emancipação socioeconômica, preparando jovens talentos para o mercado global e gerando impactos positivos sustentáveis na comunidade.',
      site: 'https://oxentecode.com.br',
      area_atuacao: 'Tecnologia & Inclusão Social',
      seal_active: true,
      last_audit_date: new Date().toISOString()
    });

    // Logado como Patrocinador para atualizar seu perfil
    await logInUser('patrocinio@oxentecode.com');
    await supabase.from('profiles').upsert({
      id: sponsorId,
      tipo_usuario: 'doador',
      nome: 'Lailson Code (Gestor ESG)',
      ong_name: 'OxenteCode Tech',
      cnpj: '12.345.678/0001-90',
      cnpj_valid: true
    });

    // Logado como Thiago para atualizar perfil
    await logInUser('thiago@oxentecode.com.br');
    await supabase.from('profiles').upsert({
      id: volId,
      tipo_usuario: 'voluntario',
      nome: 'Thiago Neves (Mentor)',
      ong_id: ongId
    });

    // Logado como Mariana para atualizar perfil
    await logInUser('mariana@oxentecode.com.br');
    await supabase.from('profiles').upsert({
      id: marianaId,
      tipo_usuario: 'voluntario',
      nome: 'Mariana Santos (Dev)',
      ong_id: ongId
    });

    // Logado como Felipe para atualizar perfil
    await logInUser('felipe@oxentecode.com.br');
    await supabase.from('profiles').upsert({
      id: felipeId,
      tipo_usuario: 'voluntario',
      nome: 'Felipe Ramos (Mentor)',
      ong_id: ongId
    });

    // Logado como Juliana para atualizar perfil
    await logInUser('juliana@oxentecode.com.br');
    await supabase.from('profiles').upsert({
      id: julianaId,
      tipo_usuario: 'voluntario',
      nome: 'Juliana Ribeiro (Designer)',
      ong_id: ongId
    });

    // Logado como Louise para atualizar perfil
    await logInUser('louiseagnes57@gmail.com', 'q1w2e3r4t5y6');
    await supabase.from('profiles').upsert({
      id: louiseId,
      tipo_usuario: 'voluntario',
      nome: 'Louise Agnes (Educadora)',
      ong_id: ongId
    });

    // ── INSERÇÃO DE AÇÕES DE CADA VOLUNTÁRIO INDIVIDUALMENTE ──────────────────
    console.log('Inserting volunteer actions and check-ins for each volunteer...');

    const baseDate = new Date();

    // 1. Thiago Neves
    await logInUser('thiago@oxentecode.com.br');
    const thiagoActions = [
      {
        user_id: volId,
        ong_id: ongId,
        title: 'Bootcamp Front-End Intensivo',
        descricao: 'Mentoria técnica e acompanhamento diário no desenvolvimento de projetos React para 10 alunos periféricos.',
        horas: 45.0,
        ods_number: 9,
        impacto: '10 jovens capacitados e aptos a construir interfaces web responsivas.'
      },
      {
        user_id: volId,
        ong_id: ongId,
        title: 'Montagem de Laboratório Social',
        descricao: 'Formatação, limpeza física e instalação de distribuições Linux em computadores doados para o laboratório da ONG.',
        horas: 16.5,
        ods_number: 9,
        impacto: '8 computadores restaurados e disponibilizados para as turmas de inclusão digital.'
      },
      {
        user_id: volId,
        ong_id: ongId,
        title: 'Workshop de Introdução ao Git e GitHub',
        descricao: 'Oficina prática de controle de versão, comandos git commit/push e publicação de portfólios no GitHub Pages.',
        horas: 8.0,
        ods_number: 10,
        impacto: '18 jovens criaram suas contas e publicaram seus primeiros portfólios profissionais.'
      },
      {
        user_id: volId,
        ong_id: ongId,
        title: 'Desenvolvimento do Site Institucional',
        descricao: 'Design de experiência (UI/UX) e codificação do portal institucional da ONG para facilitar novas campanhas de captação.',
        horas: 30.0,
        ods_number: 9,
        impacto: 'Nova landing page no ar, acelerando o tempo de carregamento e facilitando doações Pix.'
      },
      {
        user_id: volId,
        ong_id: ongId,
        title: 'Acolhimento e Roda de Conversa de Bem-Estar',
        descricao: 'Sessão coletiva de escuta e orientação com os voluntários focada em inteligência emocional e saúde mental.',
        horas: 6.0,
        ods_number: 3,
        impacto: '12 voluntários e monitores capacitados em técnicas de redução de estresse cotidiano.'
      },
      {
        user_id: volId,
        ong_id: ongId,
        title: 'Palestra de Inclusão em Escola Pública',
        descricao: 'Apresentação sobre oportunidades de carreira tecnológica para estudantes do 3º ano do Ensino Médio na Escola Estadual Winston Churchill.',
        horas: 5.0,
        ods_number: 10,
        impacto: '55 alunos inspirados, com 14 inscrições imediatas para a nova turma do bootcamp social.'
      }
    ];
    await supabase.from('volunteer_actions').insert(thiagoActions);

    const thiagoCheckins = [];
    for (let i = 0; i < 20; i++) {
      const checkedAt = new Date();
      checkedAt.setDate(baseDate.getDate() - i);
      const score = [4, 5, 4, 3, 5, 4, 5, 3, 4, 5, 4, 3, 4, 4, 5, 4, 5, 3, 4, 5][i];
      thiagoCheckins.push({
        user_id: volId,
        ong_id: ongId,
        score: score,
        checked_at: checkedAt.toISOString().slice(0, 10)
      });
    }
    await supabase.from('emotion_checkins').insert(thiagoCheckins);

    // 2. Mariana Santos
    await logInUser('mariana@oxentecode.com.br');
    const marianaActions = [
      {
        user_id: marianaId,
        ong_id: ongId,
        title: 'Apoio no Design do Dashboard',
        descricao: 'Apoio técnico na criação de telas em React para gerenciamento interno.',
        horas: 12.0,
        ods_number: 9,
        impacto: 'Componentes de UI unificados para otimizar tempo de carregamento.'
      },
      {
        user_id: marianaId,
        ong_id: ongId,
        title: 'Configuração de Rotas no App',
        descricao: 'Migração de rotas estáticas para rotas dinâmicas protegidas por perfil.',
        horas: 8.0,
        ods_number: 10,
        impacto: 'Navegação mais segura e robusta.'
      }
    ];
    await supabase.from('volunteer_actions').insert(marianaActions);

    const marianaCheckins = [];
    for (let i = 0; i < 10; i++) {
      const checkedAt = new Date();
      checkedAt.setDate(baseDate.getDate() - i);
      marianaCheckins.push({
        user_id: marianaId,
        ong_id: ongId,
        score: [5, 4, 5, 4, 5, 4, 5, 5, 4, 5][i],
        checked_at: checkedAt.toISOString().slice(0, 10)
      });
    }
    await supabase.from('emotion_checkins').insert(marianaCheckins);

    // 3. Felipe Ramos
    await logInUser('felipe@oxentecode.com.br');
    const felipeActions = [
      {
        user_id: felipeId,
        ong_id: ongId,
        title: 'Modelagem do Banco de Dados',
        descricao: 'Desenho do modelo relacional e criação de chaves estrangeiras apropriadas no Postgres.',
        horas: 10.0,
        ods_number: 9,
        impacto: 'Evitou redundância de dados e melhorou integridade referencial.'
      },
      {
        user_id: felipeId,
        ong_id: ongId,
        title: 'Otimização de Queries',
        descricao: 'Análise de performance com EXPLAIN e criação de índices nas colunas indexadas.',
        horas: 5.0,
        ods_number: 9,
        impacto: 'Redução de 60% no tempo de resposta das consultas de doação.'
      }
    ];
    await supabase.from('volunteer_actions').insert(felipeActions);

    const felipeCheckins = [];
    for (let i = 0; i < 10; i++) {
      const checkedAt = new Date();
      checkedAt.setDate(baseDate.getDate() - i);
      felipeCheckins.push({
        user_id: felipeId,
        ong_id: ongId,
        score: [3, 2, 3, 3, 4, 3, 2, 3, 3, 4][i],
        checked_at: checkedAt.toISOString().slice(0, 10)
      });
    }
    await supabase.from('emotion_checkins').insert(felipeCheckins);

    // 4. Juliana Ribeiro
    await logInUser('juliana@oxentecode.com.br');
    const julianaActions = [
      {
        user_id: julianaId,
        ong_id: ongId,
        title: 'Protótipo Figma do Fluxo de Doação',
        descricao: 'Desenvolvimento do fluxo interativo completo de doações individuais e corporativas.',
        horas: 20.0,
        ods_number: 17,
        impacto: 'Melhoria na clareza do fluxo, validado com 5 usuários de teste.'
      },
      {
        user_id: julianaId,
        ong_id: ongId,
        title: 'Definição de Design System',
        descricao: 'Documentação de cores HSL, tipografia Outfit e componentes de acessibilidade digital.',
        horas: 12.0,
        ods_number: 10,
        impacto: 'Padronização visual que acelerou o desenvolvimento em 30%.'
      }
    ];
    await supabase.from('volunteer_actions').insert(julianaActions);

    const julianaCheckins = [];
    for (let i = 0; i < 10; i++) {
      const checkedAt = new Date();
      checkedAt.setDate(baseDate.getDate() - i);
      julianaCheckins.push({
        user_id: julianaId,
        ong_id: ongId,
        score: [4, 5, 4, 5, 4, 5, 4, 4, 5, 4][i],
        checked_at: checkedAt.toISOString().slice(0, 10)
      });
    }
    await supabase.from('emotion_checkins').insert(julianaCheckins);

    // 5. Louise Agnes
    await logInUser('louiseagnes57@gmail.com', 'q1w2e3r4t5y6');
    const louiseActions = [
      {
        user_id: louiseId,
        ong_id: ongId,
        title: 'Oficina de Robótica Básica',
        descricao: 'Ensino de lógica de programação física e conexões elétricas de sensores com Arduino para estudantes de escola pública.',
        horas: 15.0,
        ods_number: 9,
        impacto: '8 jovens montaram e programaram seu primeiro robô autônomo de desvio de obstáculos.'
      },
      {
        user_id: louiseId,
        ong_id: ongId,
        title: 'Roda de Leitura Comunitária',
        descricao: 'Leitura assistida e contação de histórias com doação de livros infantojuvenis no contraturno escolar.',
        horas: 10.0,
        ods_number: 10,
        impacto: '15 crianças estimuladas à leitura com kits de livros distribuídos.'
      }
    ];
    await supabase.from('volunteer_actions').insert(louiseActions);

    const louiseCheckins = [];
    for (let i = 0; i < 10; i++) {
      const checkedAt = new Date();
      checkedAt.setDate(baseDate.getDate() - i);
      louiseCheckins.push({
        user_id: louiseId,
        ong_id: ongId,
        score: [5, 4, 5, 4, 5, 4, 5, 5, 4, 5][i],
        checked_at: checkedAt.toISOString().slice(0, 10)
      });
    }
    await supabase.from('emotion_checkins').insert(louiseCheckins);

    // ── 6. INSERIR DOAÇÕES CORPORATIVAS (BOSQUE ESG / ODS 17) ──────────────────
    console.log('Inserting corporate donations...');

    // Logado como Patrocinador para inserir doação
    await logInUser('patrocinio@oxentecode.com');

    // Usando sufixo aleatório curto nos tracking_code para evitar violação de UNIQUE key em execuções sucessivas
    const randomSuffix = () => Math.random().toString(36).substring(2, 6).toUpperCase();

    const donations = [
      {
        ong_id: ongId,
        doador_nome: 'OxenteCode Tech',
        valor: 15500.00,
        mensagem: 'Aporte estratégico anual da empresa patrocinadora para fornecimento de bolsas de estudo aos mentores.',
        company_id: sponsorId,
        tracking_code: `TX-OX-2026-${randomSuffix()}`
      },
      {
        ong_id: ongId,
        doador_nome: 'EcoBrisa Energia Renovável',
        valor: 9200.00,
        mensagem: 'Doação de incentivo para manutenção do ar condicionado e computadores do laboratório social.',
        tracking_code: `TX-EB-2026-${randomSuffix()}`
      },
      {
        ong_id: ongId,
        doador_nome: 'Potiguar S/A Engenharia',
        valor: 25000.00,
        mensagem: 'Aporte de sustentabilidade ESG corporativo focado em inovação educacional nas periferias (ODS 9).',
        tracking_code: `TX-PT-2026-${randomSuffix()}`
      },
      {
        ong_id: ongId,
        doador_nome: 'Natal Shopping Plaza',
        valor: 5000.00,
        mensagem: 'Campanha de arredondamento de troco direcionada para projetos educacionais.',
        tracking_code: `TX-SP-2026-${randomSuffix()}`
      },
      {
        ong_id: ongId,
        doador_nome: 'Carlos Souza Albuquerque',
        valor: 350.00,
        mensagem: 'Contribuição voluntária de apoio físico. Sucesso aos jovens!',
        tracking_code: `TX-PF-2026-${randomSuffix()}`
      }
    ];

    const { error: donErr } = await supabase.from('donations').insert(donations);
    if (donErr) console.error('Error inserting donations:', donErr.message);
    else console.log('Donations inserted successfully!');

    console.log('\n=== Database Seeding Complete! ===');
    console.log(`Ready for showcase!`);
    console.log(`- NGO Logins: conecta@oxentecode.com.br / 1e3f4134-99b3-4ebe-9379-c76d9e5b0799`);
    console.log(`- Sponsor Logins: patrocinio@oxentecode.com / password is '123456'`);
    console.log(`- Volunteer Logins: louiseagnes57@gmail.com / q1w2e3r4t5y6`);
  } catch (err) {
    console.error('Fatal error during seed execution:', err.message);
  }
}

seed();
