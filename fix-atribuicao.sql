-- ============================================
-- SCRIPT PARA CORRIGIR PROBLEMA DE ATRIBUIÇÃO
-- ============================================

-- PASSO 1: Verificar usuários e seus employees
-- Execute este comando para ver todos os usuários e se eles têm employee associado
SELECT 
    u.user_id,
    u.email,
    u.username,
    e.employee_id,
    e.name as employee_name,
    CASE 
        WHEN e.employee_id IS NULL THEN '❌ SEM EMPLOYEE'
        ELSE '✅ TEM EMPLOYEE'
    END as status
FROM tb_user u
LEFT JOIN tb_employee e ON e.user_id = u.user_id
ORDER BY u.user_id;

-- ============================================

-- PASSO 2: Ver todos os employees disponíveis
SELECT 
    employee_id,
    name,
    user_id,
    availability,
    CASE 
        WHEN user_id IS NULL THEN '✅ Disponível para associar'
        ELSE '❌ Já associado a um user'
    END as status
FROM tb_employee
ORDER BY employee_id;

-- ============================================

-- PASSO 3: SOLUÇÃO - Associar um employee a um user
-- IMPORTANTE: Substitua os valores [USER_ID] e [EMPLOYEE_ID] pelos IDs corretos
-- Exemplo: Se seu user_id é 1 e quer associar ao employee_id 5:
-- UPDATE tb_employee SET user_id = 1 WHERE employee_id = 5;

UPDATE tb_employee 
SET user_id = [USER_ID]  -- Substitua pelo ID do usuário logado
WHERE employee_id = [EMPLOYEE_ID];  -- Substitua pelo ID do funcionário que quer associar

-- ============================================

-- PASSO 4: Verificar se funcionou
SELECT 
    u.user_id,
    u.email,
    u.username,
    e.employee_id,
    e.name as employee_name
FROM tb_user u
INNER JOIN tb_employee e ON e.user_id = u.user_id
WHERE u.user_id = [USER_ID];  -- Substitua pelo ID do usuário

-- ============================================

-- PASSO 5 (OPCIONAL): Se não tiver nenhum employee disponível, criar um novo
-- IMPORTANTE: Substitua [USER_ID] pelo ID do usuário e ajuste os dados

INSERT INTO tb_employee (name, cpf, email, phone, position, sector_id, availability, user_id)
VALUES (
    'Nome do Funcionário',  -- Nome
    '12345678900',          -- CPF
    'email@exemplo.com',    -- Email
    '11999999999',          -- Telefone
    'Operador',             -- Cargo
    1,                      -- ID do setor (ajuste conforme necessário)
    true,                   -- Disponível
    [USER_ID]               -- ID do usuário
);

-- ============================================

-- PASSO 6: Ver employees já alocados (para evitar conflitos)
SELECT 
    aem.id as allocation_id,
    e.employee_id,
    e.name as employee_name,
    e.availability,
    m.machine_id,
    m.name as machine_name
FROM tb_allocated_employee_machine aem
INNER JOIN tb_employee e ON aem.employee_id = e.employee_id
INNER JOIN tb_machine m ON aem.machine_id = m.machine_id
ORDER BY aem.id DESC;

-- ============================================

-- DICAS:
-- 1. Execute o PASSO 1 para ver qual user precisa de employee
-- 2. Execute o PASSO 2 para ver quais employees estão disponíveis
-- 3. Execute o PASSO 3 para associar (substitua os IDs)
-- 4. Execute o PASSO 4 para confirmar
-- 5. Faça logout e login novamente no sistema
-- 6. Tente criar a atribuição novamente

-- ============================================
