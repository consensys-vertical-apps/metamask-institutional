export function getMmiPortfolioEnabled(state): boolean {
  return state.metamask.mmiConfiguration?.portfolio?.enabled;
}

export function getMmiPortfolioUrl(state): string {
  return state.metamask.mmiConfiguration?.portfolio?.url;
}

export function getShowPortfolioTooltip(state) {
  return state.metamask.showPortfolioTooltip;
}
