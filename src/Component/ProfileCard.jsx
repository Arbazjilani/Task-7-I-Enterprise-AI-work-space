// src/components/ProfileCard.jsx

function ProfileCard(props) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-200">

        {/* Profile Image */}
        <div className="relative mb-5">
          <img
            src={props.image}
            alt={props.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
          />
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
        </div>

        {/* Name & Role */}
        <h2 className="text-xl font-medium text-gray-900 mb-1">{props.name}</h2>
        <p className="text-sm font-medium text-blue-600 mb-3">{props.role}</p>

        {/* Bio */}
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{props.bio}</p>

        <hr className="w-full border-gray-100 mb-5" />

        {/* Email */}
        <div className="flex items-center gap-3 w-full mb-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-500 text-sm">✉</span>
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm text-gray-800">{props.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3 w-full mb-5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-500 text-sm">📞</span>
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400">Phone</p>
            <p className="text-sm text-gray-800">{props.phone}</p>
          </div>
        </div>

        {/* Contact Button */}
        <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium rounded-lg transition-all duration-150">
          Contact Me
        </button>

      </div>
    </div>
  );
}

export default ProfileCard;