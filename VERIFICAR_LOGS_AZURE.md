# 🔍 Como Verificar os Logs do Backend no Azure

## Problema
O backend está retornando erro 500 genérico sem detalhes da exceção.

## Solução: Ver os logs no Azure

### Opção 1: Via Portal Azure (Mais Fácil)

1. **Acesse o Portal Azure**
   - Vá para: https://portal.azure.com
   - Faça login com sua conta

2. **Encontre seu App Service**
   - No menu lateral, clique em "App Services"
   - Procure por: `sync-d8hac6hdg3czc4aa`
   - Clique no nome do serviço

3. **Acesse os Logs**
   - No menu lateral esquerdo, procure por "Monitoring"
   - Clique em "Log stream"
   - Ou clique em "Logs" para ver logs históricos

4. **Tente criar a atribuição novamente**
   - Com a tela de logs aberta
   - Volte para o sistema e tente criar uma atribuição
   - Veja o erro detalhado aparecer nos logs

### Opção 2: Via Azure CLI

```bash
# Instalar Azure CLI (se não tiver)
# Windows: https://aka.ms/installazurecliwindows
# Mac: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Fazer login
az login

# Ver logs em tempo real
az webapp log tail --name sync-d8hac6hdg3czc4aa --resource-group [NOME_DO_RESOURCE_GROUP]

# Ou baixar os logs
az webapp log download --name sync-d8hac6hdg3czc4aa --resource-group [NOME_DO_RESOURCE_GROUP] --log-file logs.zip
```

### Opção 3: Via Kudu (Console do Azure)

1. Acesse: `https://sync-d8hac6hdg3czc4aa.scm.azurewebsites.net`
2. Vá em "Debug Console" → "CMD"
3. Navegue até: `LogFiles/Application`
4. Abra o arquivo mais recente

---

## O que procurar nos logs

Procure por estas mensagens de erro:

### 1. Erro de Employee não associado
```
NaoRegistradoException: Por favor, relacione um employee ao user
```
**Solução:** Execute o SQL para associar employee ao user

### 2. Erro de Employee já alocado
```
ConflitoCampoException: O funcionário já está alocado em uma máquina
```
**Solução:** Desaloque o funcionário primeiro

### 3. Erro de Employee não encontrado
```
NaoRegistradoException: Funcionário não encontrado
```
**Solução:** Verifique se o ID do funcionário existe

### 4. Erro de NullPointerException
```
java.lang.NullPointerException
```
**Solução:** Algum campo obrigatório está null

---

## Exemplo de Log Completo

```
2025-12-01 12:11:01.708 ERROR 1234 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : 
Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception 
[Request processing failed; nested exception is 
com.projeto.tcc.exceptions.NaoRegistradoException: Por favor, relacione um employee ao user] 
with root cause

com.projeto.tcc.exceptions.NaoRegistradoException: Por favor, relacione um employee ao user
	at com.projeto.tcc.service.AllocatedEmployeeMachineService.createAllocatedEmployees(AllocatedEmployeeMachineService.java:40)
	at com.projeto.tcc.controller.AllocatedEmployeeMachineController.saveAllocation(AllocatedEmployeeMachineController.java:26)
```

---

## Solução Rápida (Sem acesso ao banco)

Se você não tem acesso ao banco de dados agora, você pode:

1. **Pedir para o administrador do sistema** executar o SQL:
   ```sql
   -- Ver qual user precisa de employee
   SELECT user_id, email FROM tb_user WHERE email = 'SEU_EMAIL@exemplo.com';
   
   -- Ver employees disponíveis
   SELECT employee_id, name FROM tb_employee WHERE user_id IS NULL;
   
   -- Associar
   UPDATE tb_employee SET user_id = [USER_ID] WHERE employee_id = [EMPLOYEE_ID];
   ```

2. **Ou criar um endpoint temporário** no backend para fazer isso via API

3. **Ou usar outro usuário** que já tenha employee associado

---

## Verificar se o problema é de permissão

O endpoint requer permissão de ADMIN ou GERENTE:

```java
@PreAuthorize("hasAnyAuthority('SCOPE_ADMIN', 'SCOPE_GERENTE')")
```

Verifique se seu usuário tem uma dessas roles:

```sql
SELECT 
    u.email,
    r.name as role
FROM tb_user u
INNER JOIN tb_user_roles ur ON u.user_id = ur.user_id
INNER JOIN tb_role r ON ur.role_id = r.role_id
WHERE u.email = 'SEU_EMAIL@exemplo.com';
```

---

## Contato com Suporte

Se nada disso funcionar, entre em contato com o administrador do sistema com estas informações:

- **URL do erro:** `/allocated-employee-machine`
- **Status:** 500
- **Timestamp:** [copie do erro]
- **Seu email de login:** [seu email]
- **IDs enviados:** Employee ID e Machine ID

O administrador poderá verificar os logs do Azure e corrigir o problema.
