import type { FixOption } from "../core/types";

interface FixOptionsProps {
  options: FixOption[];
  onChoose: (fixId: string) => void;
}

/** Multiple-choice replacements for the buggy line. */
export function FixOptions({ options, onChoose }: FixOptionsProps) {
  return (
    <section aria-labelledby="fix-heading" className="fixes">
      <h2 id="fix-heading" className="fixes__title">Pick the fix</h2>
      <ul className="fixes__list">
        {options.map((option) => (
          <li key={option.id}>
            <button type="button" className="fixes__option" onClick={() => onChoose(option.id)}>
              <code>{option.text.trim()}</code>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
