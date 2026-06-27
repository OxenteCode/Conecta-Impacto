-- ============================================================
-- Conecta Impacto — Colunas de Detalhes da ONG
-- Migração: add_ong_profile_fields
-- ============================================================
-- Adiciona colunas para que as ONGs possam ter descrição, missão, 
-- site, cidade e área de atuação salvos diretamente no banco de dados.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS missao TEXT,
ADD COLUMN IF NOT EXISTS site TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT DEFAULT 'Natal/RN',
ADD COLUMN IF NOT EXISTS area_atuacao TEXT DEFAULT 'Assistência Social';

-- Semeia dados reais nas ONGs de teste pelo CNPJ (caso já estejam cadastradas)
UPDATE public.profiles
SET 
  descricao = 'A Casa de Apoio à Criança com Câncer Durval Paiva atua no amparo a crianças e adolescentes com câncer e doenças hematológicas há mais de 28 anos, fornecendo acolhimento, refeições, transporte e assistência social.',
  missao = 'Apoio ao tratamento e cura do câncer e doenças hematológicas infantojuvenis, resgatando a cidadania e dignidade das famílias.',
  site = 'https://www.casadurvalpaiva.org.br',
  cidade = 'Natal/RN',
  area_atuacao = 'Saúde & Apoio Infantil'
WHERE cnpj = '01.396.800/0001-36' OR cnpj = '01396800000136';

UPDATE public.profiles
SET 
  descricao = 'O Grupo de Apoio à Criança com Câncer do RN (GACC-RN) oferece suporte biopsicossocial para garantir a continuidade do tratamento de crianças e jovens com câncer, combatendo a evasão e promovendo a cura.',
  missao = 'Prestar assistência integral a crianças e adolescentes com câncer e suporte às suas famílias durante todo o tratamento.',
  site = 'https://www.gaccrn.org.br',
  cidade = 'Natal/RN',
  area_atuacao = 'Saúde & Apoio Infantil'
WHERE cnpj = '41.007.923/0001-52' OR cnpj = '41007923000152';

UPDATE public.profiles
SET 
  descricao = 'A Liga Contra o Câncer é o principal centro de referência oncológica do Rio Grande do Norte, atuando na prevenção, diagnóstico precoce e tratamento de alta complexidade com foco na excelência e humanização.',
  missao = 'Prevenção, diagnóstico e tratamento oncológico de excelência, com ensino e pesquisa, acessível a todos.',
  site = 'https://www.ligacontraocancer.com.br',
  cidade = 'Natal/RN',
  area_atuacao = 'Saúde Oncológica'
WHERE cnpj = '08.428.765/0001-39' OR cnpj = '08428765000139';
