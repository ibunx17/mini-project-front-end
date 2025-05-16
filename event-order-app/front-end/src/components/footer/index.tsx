export default function Footer() {
  return (
    <footer className="bg-gray-800 pt-24 pb-12">
      <div className="container">
        <div className="flex flex-wrap">
          <div className="w-full px-4 mb-12 text-gray-300 font-medium md:w-1/3">
            <h2 className="font-bold text-4xl text-white">TIN(k)</h2>
            <h3 className="font-bold text-2xl mb-2">Contact Us</h3>
            <p>XYZ@mail.com</p>
            <p>
              Jl. Pahlawan No.72, Neglasari, Kec. Cibeunying Kaler,
              <span>Kota Bandung, Jawa Barat 40123</span>{" "}
            </p>
          </div>
          <div className="w-full px-4 mb-12 text-gray-300 font-medium md:w-1/3">
            <h3 className="font-semibold text-xl text-white mb-5">
              Tentang Tiketin.com
            </h3>
            <ul className="text-slate-300">
              <li>
                <a
                  href="/login"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  Masuk
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  Lihat Event
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  Syarat dan ketentuan
                </a>
              </li>
            </ul>
          </div>
          <div className="w-full px-4 mb-12 text-gray-300 font-medium md:w-1/3">
            <h3 className="font-semibold text-xl text-white mb-5">Blog</h3>
            <ul className="text-gray-300">
              <li>
                <a
                  href="#"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  Life style
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  Sportainment
                </a>
              </li>
              <li>
                <a
                  href="#skills"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  Culiner
                </a>
              </li>
              <li>
                <a
                  href="#portfolio"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  Travel
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  Experience
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="inline-block text-base hover:text-gray-600 mb-3"
                >
                  Testimonials
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="w-full pt-10 border-t border-slate-700">
          <div className="flex items-center justify-center">
            <p className="text-gray-300">
              Created by Robby Fachreza Putra and Iqbal Maulana using
              <a
                href="https://tailwindcss.com"
                target="_blank"
                className="font-bold text-sky-500"
              >
                Tailwind CSS
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
