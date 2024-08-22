
class primaryButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const buttonText = this.getAttribute('text') || 'Default Text';

    this.shadowRoot.innerHTML = `
      <style>
        .button {
          width: 177px; 
          height: 2.5rem; /* Tailwind's h-10 is 2.5rem */
          padding: 0.3rem; /* Tailwind's p-3 is 0.75rem */
          background-color: #1c44ac;
          border-radius: 0.5rem; /* Tailwind's rounded-lg is 0.5rem */
          border: 1px solid #b0b5fa;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem; /* Tailwind's gap-2 is 0.5rem */
        }

        .button:hover {
          background-color: #e0e0e0; /* Hover color */
        }
        .button-text {
          color: #f5f5f5; /* Tailwind's text-neutral-100 */
          font-size: 1rem; /* Tailwind's text-base is 1rem */
          font-weight: 400; /* Tailwind's font-normal is 400 */
          font-family: 'Inter', sans-serif; /* Custom font */
          line-height: 1.5; /* Tailwind's leading-none is 1.5 */
        }
      </style>
      <button class="button">
        <span class="button-text">${buttonText}</span>
      </button>
    `;
  }
}

customElements.define('primary-button', primaryButton);

class secondaryButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const buttonText = this.getAttribute('text') || 'Default Text';

    this.shadowRoot.innerHTML = `
      <style>
        .button {
          width: 4rem; /* Tailwind's w-16 is 4rem */
          height: 30px;
          background-color: #f1fea4;
          border-radius: 20px; /* Tailwind's rounded-[20px] */
          display: flex;
          justify-content: center;
          border: 1px solid #f1fea4;
          align-items: center;
          color: #1c44ac; /* Text color */
        }
          .button:hover {
          background-color: #e0e0e0; /* Hover color */
        }
      </style>
      <button class="button">
        <span>${buttonText}</span>
      </button>
    `;
  }
}

customElements.define('secondary-button', secondaryButton);
