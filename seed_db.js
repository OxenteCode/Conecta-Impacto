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

async function seed() {
  console.log('--- Starting Seed Script ---');

  let ongId = null;
  let voluntarioId = null;

  // 1. Criar ou Obter conta de ONG
  const ongEmail = 'ong@conectaimpacto.org';
  const password = 'password123';
  console.log(`Setting up ONG account: ${ongEmail}`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: ongEmail,
      password: password,
      options: {
        data: { nome: 'Lúcia Lemos (Gestora)', tipo_usuario: 'ong', ong_name: 'Instituto Conecta RN' }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ONG already registered, signing in...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: ongEmail,
          password: password
        });
        if (loginError) throw loginError;
        ongId = loginData.user.id;
      } else {
        throw error;
      }
    } else {
      ongId = data.user.id;
      console.log('ONG account created successfully!');
    }
  } catch (err) {
    console.error('Error setting up ONG:', err.message);
    return;
  }

  // 2. Criar ou Obter conta de Voluntário
  const volEmail = 'voluntario@conectaimpacto.org';
  console.log(`Setting up Volunteer account: ${volEmail}`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: volEmail,
      password: password,
      options: {
        data: { nome: 'Maria Silva', tipo_usuario: 'voluntario' }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('Volunteer already registered, signing in...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: volEmail,
          password: password
        });
        if (loginError) throw loginError;
        voluntarioId = loginData.user.id;
      } else {
        throw error;
      }
    } else {
      voluntarioId = data.user.id;
      console.log('Volunteer account created successfully!');
    }
  } catch (err) {
    console.error('Error setting up Volunteer:', err.message);
    return;
  }

  console.log(`ONG ID: ${ongId}`);
  console.log(`Volunteer ID: ${voluntarioId}`);

  // Forçar atualização do perfil da ONG no banco de dados
  console.log('Updating profiles in database...');
  await supabase.from('profiles').upsert({
    id: ongId,
    tipo_usuario: 'ong',
    nome: 'Lúcia Lemos (Gestora)',
    ong_name: 'Instituto Conecta RN'
  });

  await supabase.from('profiles').upsert({
    id: voluntarioId,
    tipo_usuario: 'voluntario',
    nome: 'Maria Silva'
  });

  // Limpar registros antigos para evitar poluição
  console.log('Clearing old test data...');
  await supabase.from('volunteer_actions').delete().eq('user_id', voluntarioId);
  await supabase.from('emotion_checkins').delete().eq('user_id', voluntarioId);
  await supabase.from('donations').delete().eq('ong_id', ongId);

  // 3. Inserir Check-ins Emocionais Fictícios (ODS 3)
  console.log('Inserting mock emotional check-ins...');
  const checkins = [
    { user_id: voluntarioId, ong_id: ongId, score: 5, checked_at: '2026-06-22' },
    { user_id: voluntarioId, ong_id: ongId, score: 4, checked_at: '2026-06-23' },
    { user_id: voluntarioId, ong_id: ongId, score: 3, checked_at: '2026-06-24' },
    { user_id: voluntarioId, ong_id: ongId, score: 2, checked_at: '2026-06-25' }, // Indica desgaste / cansaço
    { user_id: voluntarioId, ong_id: ongId, score: 4, checked_at: '2026-06-26' }
  ];
  const { error: chkErr } = await supabase.from('emotion_checkins').insert(checkins);
  if (chkErr) console.error('Error inserting checkins:', chkErr.message);
  else console.log('Emotional check-ins inserted successfully!');

  // 4. Inserir Ações Voluntárias Fictícias (Métricas ESG e ODS)
  console.log('Inserting mock volunteer actions...');
  const actions = [
    { user_id: voluntarioId, ong_id: ongId, descricao: 'Distribuição de refeições comunitárias', horas: 12.5, ods_number: 3, impacto: '50 refeições e suporte de saúde básica entregues' },
    { user_id: voluntarioId, ong_id: ongId, descricao: 'Mentoria em desenvolvimento de software para jovens', horas: 20.0, ods_number: 9, impacto: '4 jovens capacitados em lógica de programação' },
    { user_id: voluntarioId, ong_id: ongId, descricao: 'Triagem e organização de roupas e agasalhos', horas: 8.5, ods_number: 10, impacto: '30 famílias atendidas no bairro Planalto' },
    { user_id: voluntarioId, ong_id: ongId, descricao: 'Assessoria jurídica para regularização de ONGs locais', horas: 15.0, ods_number: 16, impacto: '1 estatuto social revisado e adequado à legislação' },
    { user_id: voluntarioId, ong_id: ongId, descricao: 'Reunião de parceria para captação de recursos corporativos', horas: 6.0, ods_number: 17, impacto: 'Conexão com 2 novas empresas patrocinadoras' }
  ];
  const { error: actErr } = await supabase.from('volunteer_actions').insert(actions);
  if (actErr) console.error('Error inserting actions:', actErr.message);
  else console.log('Volunteer actions inserted successfully!');

  // 5. Inserir Doações Fictícias (Selo de Transparência e Floresta do Impacto)
  console.log('Inserting mock donations...');
  const donations = [
    { ong_id: ongId, doador_nome: 'Potiguar S/A', valor: 2500.00, mensagem: 'Apoio mensal para manutenção das atividades de inclusão digital.' },
    { ong_id: ongId, doador_nome: 'Natal Soluções ESG', valor: 1500.00, mensagem: 'Doação corporativa focada nos Objetivos Globais da ONU.' },
    { ong_id: ongId, doador_nome: 'EcoBrisa Energia', valor: 800.00, mensagem: 'Juntos fortalecendo a rede do bem no RN!' },
    { ong_id: ongId, doador_nome: 'Carlos Eduardo Souza', valor: 150.00, mensagem: 'Parabéns pelo trabalho exemplar com a comunidade.' }
  ];
  const { error: donErr } = await supabase.from('donations').insert(donations);
  if (donErr) console.error('Error inserting donations:', donErr.message);
  else console.log('Donations inserted successfully!');

  console.log('--- Database Seed Complete! ---');
}

seed();
