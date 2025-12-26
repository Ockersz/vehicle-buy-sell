export default function Profile() {
  return (
    <div className="p-4 md:p-0 space-y-3">
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-base-content/70">
            Login + OTP + My Listings will come after the UI flow is done.
          </p>
          <button className="btn btn-outline mt-2">Login</button>
        </div>
      </div>
    </div>
  );
}
