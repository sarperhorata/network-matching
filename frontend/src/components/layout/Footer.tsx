export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container-app mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Oniki.net. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

