/** Decorative illustration, not the floor plan of an advertised property. */
export function ArchitectureGraphic() {
  return (
    <svg
      viewBox="0 0 560 440"
      fill="none"
      className="architecture-graphic"
      data-gsap-plan
      aria-hidden="true"
    >
      <g
        className="architecture-grid"
        stroke="currentColor"
        strokeWidth=".6"
        opacity=".16"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={`a${i}`}
            d={`M${25 + i * 45} ${260 - i * 25}l270 155M${25 + i * 45} ${260 + i * 25}l270-155`}
          />
        ))}
      </g>
      <g className="plan-building">
        <path
          className="plan-face"
          d="M160 140L300 220V340L160 260Z"
          fill="#b8c6b8"
          fillOpacity=".55"
        />
        <path
          className="plan-face"
          d="M300 220L440 140V260L300 340Z"
          fill="#789789"
          fillOpacity=".35"
        />
        <path
          className="plan-face"
          d="M160 140L300 60L440 140L300 220Z"
          fill="#e2c7a7"
          fillOpacity=".6"
        />
        <g
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          className="plan-lines"
        >
          <path
            className="plan-stroke"
            pathLength="100"
            d="M160 260V140L300 60L440 140V260L300 340L160 260Z"
          />
          <path
            className="plan-stroke"
            pathLength="100"
            d="M160 140L300 220L440 140M300 220V340"
          />
          <path
            className="plan-stroke"
            pathLength="100"
            d="M160 200L300 280L440 200"
          />
          <path
            className="plan-stroke"
            pathLength="100"
            d="M180 128L300 198L420 128M300 80V198"
          />
          <path
            className="plan-stroke"
            pathLength="100"
            d="M185 159V184L222 205V180ZM240 191V216L276 237V212Z"
          />
          <path
            className="plan-stroke"
            pathLength="100"
            d="M325 218V243L362 222V197ZM383 185V210L420 189V164Z"
          />
          <path
            className="plan-stroke"
            pathLength="100"
            d="M185 218V244L222 265V239ZM324 278V304L363 282V256Z"
          />
          <path
            className="plan-stroke"
            pathLength="100"
            d="M246 310V265L278 283V328"
          />
        </g>
        <g className="plan-window" fill="#c39a6e" fillOpacity=".6">
          <path d="M186 161V182L220 201V181ZM241 193V214L274 233V213Z" />
          <path d="M326 220V240L360 221V200ZM384 187V207L418 188V168Z" />
        </g>
      </g>
      <path
        className="plan-route"
        pathLength="100"
        d="M75 300L150 343L212 307M320 375L480 283"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 6"
        opacity=".5"
      />
      <g className="plan-key" transform="translate(420 335)">
        <circle r="37" fill="#f5eddf" />
        <g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="-7" cy="-7" r="9" />
          <path d="M0 0L17 17M10 10L15 5M15 15L20 10" />
        </g>
      </g>
      <g className="plan-coordinate" stroke="currentColor" strokeWidth="1.5">
        <path d="M81 155V177M70 166H92M470 85V107M459 96H481" />
      </g>
    </svg>
  );
}
