import type { Request, Response, NextFunction } from 'express'
import { httpDuration, httpRequests, lastSeen } from '../routes/metricsRoutes.ts'

// requests on these paths are not measured
const IGNORED_PATHS = ['/health']

// This middleware measures the duration of each HTTP request and counts the number of requests per route and status code.
// It also tracks the last seen timestamp of each user, if the request has a userId property.
function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
	if (IGNORED_PATHS.some((path) => req.path.startsWith(path)))
		return next()
	const end = httpDuration.startTimer()
	res.on('finish', () => {
		const route = req.route ? req.baseUrl + req.route.path : 'unmatched'
		httpRequests.inc({ method: req.method, route, status: res.statusCode })
		end({ method: req.method, route })
		if (req.userId)
			lastSeen.set(req.userId, Date.now())
	})
	next()
}

export default metricsMiddleware
