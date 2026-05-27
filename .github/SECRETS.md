# GitHub Secrets required by CI/CD workflows

Go to: **Settings → Secrets and variables → Actions** → Add the following:

| Secret | Used By | Description |
|---|---|---|
| `SOLANA_DEPLOY_KEYPAIR` | `deploy-devnet.yml` | Full JSON array of the deploy authority keypair (e.g. `[123,45,…]`) |
| `NPM_TOKEN` | `publish-sdk.yml` | npm automation token with `publish` permission — create at https://www.npmjs.com/settings/tokens |
| `VERCEL_TOKEN` | `deploy-landing.yml` | Vercel personal access token — create at https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `deploy-landing.yml` | Vercel team/user ID (run `vercel teams list` or check `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | `deploy-landing.yml` | Vercel project ID (check `.vercel/project.json`) |
| `GH_PAT` | `publish-sdk.yml` | (Optional) GitHub PAT with `repo` scope — needed if `GITHUB_TOKEN` cannot push |

## First deploy flow

1. Push this repo to GitHub
2. Go to **Settings → Secrets** and add all secrets above
3. Run **Deploy to Solana Devnet** workflow manually (Actions tab)
4. After deploy, update `packages/sdk/src/constants/index.ts` with actual program IDs
5. Run **Publish @zkcreditscore/sdk** workflow
6. Landing page auto-deploys on every `main` push
