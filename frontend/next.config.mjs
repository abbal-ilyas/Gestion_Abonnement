/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			{
				source: "/backend-api/:path*",
				destination: `${process.env.BACKEND_INTERNAL_URL || "http://backend:8080/api"}/:path*`,
			},
		];
	},
};

export default nextConfig;
