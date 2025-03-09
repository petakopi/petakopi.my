module.exports = {
  mode: 'jit',
  theme: {
    extend: {
      colors: {
        'brown': {
          DEFAULT: '#7A4F38',
          '50': '#D0AC99',
          '100': '#CAA18B',
          '200': '#BD8A6F',
          '300': '#B07453',
          '400': '#966145',
          '500': '#7A4F38',
          '600': '#543626',
          '700': '#2D1D15',
          '800': '#070403',
          '900': '#000000'
        }
      }
    }
  },
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/javascript/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-displaymodes')
  ],
}
