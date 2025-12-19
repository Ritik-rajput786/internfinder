const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          About <span className="text-blue-600">JobFinder</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          Your trusted platform to discover real jobs and internships across India —
          built for students, freshers, and professionals.
        </p>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-4">
            🎯
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Our Mission
          </h3>
          <p className="text-gray-600">
            To simplify the job and internship search process by providing
            verified, India-based opportunities in one place.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-xl font-bold mb-4">
            🚀
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            What We Offer
          </h3>
          <p className="text-gray-600">
            A real-world job portal experience with apply, cancel, tracking,
            and verified company listings — just like top platforms.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xl font-bold mb-4">
            🇮🇳
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            India-Focused
          </h3>
          <p className="text-gray-600">
            All jobs and internships are tailored for Indian cities, colleges,
            and students — no fake or foreign listings.
          </p>
        </div>
      </section>

      {/* Footer Note */}
      <div className="text-center pb-10">
        <p className="text-gray-500">
          Built with ❤️ using MERN Stack to help you build your future.
        </p>
      </div>
    </div>
  );
};

export default About;

