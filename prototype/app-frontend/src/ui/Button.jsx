const Button = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`px-5 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
