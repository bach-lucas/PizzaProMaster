import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-[#2C5530] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading font-bold text-xl mb-4">Pizza ZZA forno a lenha</h3>
<p className="mb-4">Autêntica pizza italiana feita com paixão e os melhores ingredientes em forno a lenha tradicional.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-[#FFA41B]" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-5 h-5 fill-current">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#FFA41B]" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 fill-current">
                  <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#FFA41B]" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#FFA41B]" aria-label="Yelp">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-5 h-5 fill-current">
                  <path d="M42.9 240.32l99.62 48.61c19.2 9.4 16.2 37.51-4.5 42.71L30.5 358.45c-21.4 5.3-40.2-13.5-34.9-34.9l28.66-115.15c5.2-20.8 33.3-23.8 42.74-4.6zm44.01-96.12L87.1 85.65c-5.3-21.4 13.5-40.2 34.9-34.9l106.8 26.51c20.1 5 23.8 28.3 6.7 41.41L155.1 189.7c-16.4 12.5-39.5 1.7-44.9-16.6l-23.29-28.9zm-90.14 35.76l-3.7-14.9c-5.3-21.4 13.5-40.2 34.9-34.9l99.3 24.62c20.1 5 23.8 28.3 6.7 41.41l-68.6 52.31c-16.4 12.5-39.5 1.7-44.9-16.6l-23.7-52.03zM272 416c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32zm47.7-192.1l-99.7 48.6c-19.2 9.4-16.2 37.5 4.5 42.7l117.6 29.1c21.4 5.3 40.2-13.5 34.9-34.9l-28.6-115.1c-5.2-20.8-33.2-23.8-42.7-4.6zm89.7 118.8l-10.8 10.5c-13.4 13-34.9 13-48.3 0l-47.3-45.9c-13.4-13-13.4-34.5 0-47.5l10.8-10.5c13.4-13 34.9-13 48.3 0l47.3 45.9c13.4 13 13.4 34.5 0 47.5zM193.2 66.66L96.15 126.5c-17.1 10.5-22.5 33.5-12 50.6l60.08 97.05c10.6 17.2 33.5 22.6 50.6 12l97.05-59.93c17.2-10.6 22.6-33.5 12-50.6l-59.93-97.15c-10.55-17.2-33.5-22.5-50.75-11.9z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#FFA41B]">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#FFA41B]">
                  Cardápio
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFA41B]">Sobre Nós</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFA41B]">Contato</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFA41B]">Trabalhe Conosco</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Rua da Pizza, 123, São Paulo, SP</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(11) 99876-5432</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contato@bellapizza.com.br</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Horários</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Segunda - Quinta</span>
                <span>11h - 22h</span>
              </li>
              <li className="flex justify-between">
                <span>Sexta - Sábado</span>
                <span>11h - 23h</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo</span>
                <span>12h - 21h</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Bella Pizza. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
