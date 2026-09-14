// No plugins. Tailwind is gone: not one utility class was used anywhere on the
// site, and the import cost 50KB in front of the first paint. Every rule the
// page needs is hand-written in src/app/*.css.
export default { plugins: {} };
