/*
 * This file exists solely to maintain backwards compatibility for modules that
 * import `useProposalManager` with the `.jsx` extension.  The full
 * implementation has been moved to `useProposalManager.js`.  To avoid
 * duplicating the logic and risking divergence, we simply re-export
 * everything from the `.js` module.
 */

export * from './useProposalManager.js';
