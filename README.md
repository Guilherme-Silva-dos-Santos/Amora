# 🫐 Amora — Corretor Ortográfico

Extensão para navegadores que corrige ortografia em português diretamente nos campos de texto das páginas web.

---

## 📋 Descrição

A Amora analisa automaticamente o texto digitado em campos de texto e exibe um ícone indicando o status da análise. Ao clicar no ícone, o usuário visualiza os erros encontrados e pode corrigi-los com um clique.

---

## ✨ Funcionalidades

- Análise automática após 1 segundo sem digitação
- Ícone de status no canto inferior direito de cada campo
- Popup com erros e sugestões de correção
- Correção de todos os erros com um clique
- Compatível com sites que usam frameworks modernos (React, Vue, Angular)
- Detecção automática de novos campos na página

---

## 🔄 Status dos Ícones

| Ícone | Significado |
|---|---|
| Analisando | Verificando o texto com a API |
| Correto | Nenhum erro encontrado ou texto já corrigido |

## 🛠️ Tecnologias

- HTML, CSS, JavaScript
- Chrome Extensions API (Manifest V3)
- [LanguageTool API](https://languagetool.org) — análise ortográfica em português

---

## 🚀 Como instalar localmente

1. Clone o repositório
2. Abra o Chrome e acesse `chrome://extensions/`
3. Ative o **Modo do desenvolvedor**
4. Clique em **Carregar sem compactação**
5. Selecione a pasta do projeto

---

## 📌 Versões

| Versão | Descrição |
|---|---|
| 0.1.0 | Desenvolvimento inicial com LanguageTool API |
| 1.0.0 | Primeira versão pública |
| 2.0.0 | API própria em Java + MySQL |

---

## 📄 Licença

Este projeto está sob a licença disponível no arquivo [LICENSE](LICENSE).

---

## 🧑‍🎓 Autor
Guilherme Silva