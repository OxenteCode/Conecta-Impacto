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

async function getOrCreateUser(email, defaultMetadata) {
  console.log(`Setting up account: ${email}`);
  
  // 1. Tentar cadastro
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: '123456',
    options: { data: defaultMetadata }
  });

  if (!signUpError && signUpData.user) {
    console.log(`Account ${email} created successfully!`);
    return signUpData.user.id;
  }

  // 2. Se já existe, tentar fazer login com '123456' ou 'password123'
  if (signUpError && signUpError.message.includes('already registered')) {
    console.log(`Account ${email} already registered. Trying to log in...`);
    
    // Tentar '123456'
    let { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: '123456'
    });

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

    console.log('\n--- User IDs Resolved ---');
    console.log(`NGO (conecta@oxentecode.com.br): ${ongId}`);
    console.log(`Sponsor (patrocinio@oxentecode.com): ${sponsorId}`);
    console.log(`Volunteer (thiago@oxentecode.com.br): ${volId}`);
    console.log('-------------------------\n');

    // ── ATUALIZAR TABELA PROFILES ─────────────────────────────────────────────
    console.log('Updating profiles in database...');
    
    // Atualizar perfil da ONG Oxente Code Tech
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
      seal_active: 'Ouro',
      last_audit_date: new Date().toISOString()
    });

    // Atualizar perfil do Patrocinador OxenteCode Tech
    await supabase.from('profiles').upsert({
      id: sponsorId,
      tipo_usuario: 'doador',
      nome: 'Lailson Code (Gestor ESG)',
      ong_name: 'OxenteCode Tech',
      cnpj: '12.345.678/0001-90',
      cnpj_valid: true
    });

    // Atualizar perfil do Voluntário Thiago Neves
    await supabase.from('profiles').upsert({
      id: volId,
      tipo_usuario: 'voluntario',
      nome: 'Thiago Neves (Mentor)',
      ong_id: ongId
    });

    // ── LIMPEZA DE REGISTROS ANTIGOS DA ONG ──────────────────────────────────
    console.log('Cleaning old records for this NGO to ensure freshness...');
    await supabase.from('volunteer_actions').delete().eq('ong_id', ongId);
    await supabase.from('emotion_checkins').delete().eq('ong_id', ongId);
    await supabase.from('donations').delete().eq('ong_id', ongId);

    // ── 1. INSERIR AÇÕES VOLUNTÁRIAS DO THIAGO (METRICAS ESG) ────────────────
    console.log('Inserting volunteer actions (ODS 3, 9, 10, 16, 17)...');
    const actions = [
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

    const { error: actErr } = await supabase.from('volunteer_actions').insert(actions);
    if (actErr) console.error('Error inserting actions:', actErr.message);
    else console.log('Volunteer actions inserted successfully!');

    // ── 2. INSERIR HISTÓRICO DE CHECK-INS EMOCIONAIS (ODS 3) ─────────────────
    console.log('Inserting historical emotional check-ins...');
    const checkins = [];
    const baseDate = new Date();
    // Gera 20 check-ins cobrindo os últimos 20 dias
    for (let i = 0; i < 20; i++) {
      const checkedAt = new Date();
      checkedAt.setDate(baseDate.getDate() - i);
      const score = [4, 5, 4, 3, 5, 4, 5, 3, 4, 5, 4, 3, 4, 4, 5, 4, 5, 3, 4, 5][i];
      checkins.push({
        user_id: volId,
        ong_id: ongId,
        score: score,
        checked_at: checkedAt.toISOString().slice(0, 10)
      });
    }

    const { error: chkErr } = await supabase.from('emotion_checkins').insert(checkins);
    if (chkErr) console.error('Error inserting checkins:', chkErr.message);
    else console.log('Emotional check-ins inserted successfully!');

    // ── 3. INSERIR DOAÇÕES CORPORATIVAS (BOSQUE ESG / ODS 17) ──────────────────
    console.log('Inserting corporate donations...');
    const donations = [
      {
        ong_id: ongId,
        doador_nome: 'OxenteCode Tech',
        valor: 15500.00,
        mensagem: 'Aporte estratégico anual da empresa patrocinadora para fornecimento de bolsas de estudo aos mentores.',
        company_id: sponsorId,
        tracking_code: 'TX-OXENTECODE-2026'
      },
      {
        ong_id: ongId,
        doador_nome: 'EcoBrisa Energia Renovável',
        valor: 9200.00,
        mensagem: 'Doação de incentivo para manutenção do ar condicionado e computadores do laboratório social.',
        tracking_code: 'TX-ECOBRISA-2026'
      },
      {
        ong_id: ongId,
        doador_nome: 'Potiguar S/A Engenharia',
        valor: 25000.00,
        mensagem: 'Aporte de sustentabilidade ESG corporativo focado em inovação educacional nas periferias (ODS 9).',
        tracking_code: 'TX-POTIGUAR-2026'
      },
      {
        ong_id: ongId,
        doador_nome: 'Natal Shopping Plaza',
        valor: 5000.00,
        mensagem: 'Campanha de arredondamento de troco direcionada para projetos educacionais.',
        tracking_code: 'TX-SHOPPING-2026'
      },
      {
        ong_id: ongId,
        doador_nome: 'Carlos Souza Albuquerque',
        valor: 350.00,
        mensagem: 'Contribuição voluntária de apoio físico. Sucesso aos jovens!',
        tracking_code: 'TX-PF-CSOUZA-2026'
      }
    ];

    const { error: donErr } = await supabase.from('donations').insert(donations);
    if (donErr) console.error('Error inserting donations:', donErr.message);
    else console.log('Donations inserted successfully!');

    console.log('\n=== Database Seeding Complete! ===');
    console.log(`Ready for showcase!`);
    console.log(`- NGO Logins: conecta@oxentecode.com.br / 1e3f4134-99b3-4ebe-9379-c76d9e5b0799`);
    console.log(`- Sponsor Logins: patrocinio@oxentecode.com / password is '123456'`);
  } catch (err) {
    console.error('Fatal error during seed execution:', err.message);
  }
}

seed();
