/**
 * Example frontend plugin — registers sidebar and header UI slots.
 */
export const name = 'example-plugin';

function renderBanner(root, context) {
  const greeting =
    typeof context.config?.greeting === 'string' && context.config.greeting.trim()
      ? context.config.greeting.trim()
      : 'Hello from example-plugin';
  const campaign = context.campaignSlug ? ` · ${context.campaignSlug}` : '';
  root.className =
    'esiana-plugin-surface rounded-lg border border-border bg-elevated/50 px-3 py-2 text-xs text-muted';
  root.textContent = `${greeting}${campaign}`;
}

export function register(registry) {
  registry.registerSlot('sidebar', {
    render(root, context) {
      renderBanner(root, context);
    },
  });

  registry.registerSlot('header', {
    render(root, context) {
      root.className =
        'esiana-plugin-surface rounded-md border border-border bg-elevated/80 px-2 py-1 text-xs text-muted';
      const greeting =
        typeof context.config?.greeting === 'string'
          ? context.config.greeting.trim()
          : 'Example';
      root.textContent = greeting;
    },
  });
}
