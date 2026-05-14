import express from "express";
import { departments, subjects } from "../db/schema";
import {
    and,
    desc,
    eq,
    getTableColumns,
    ilike,
    or,
    sql
} from "drizzle-orm";
import { db } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const {
            search,
            department,
            page = "1",
            limit = "10"
        } = req.query;

        const MAX_LIMIT = 100;
        const parsedPage =
                        typeof page === "string" ? Number.parseInt(page, 10) : Number.NaN;
        const parsedLimit =
                        typeof limit === "string" ? Number.parseInt(limit, 10) : Number.NaN;

        const currentPage =
                        Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
        const limitPerPage =
                        Number.isFinite(parsedLimit) && parsedLimit > 0
                            ? Math.min(parsedLimit, MAX_LIMIT)
                                : 10;

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        // Search filter
        if (typeof search === "string" && search.trim()) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }

        // Department filter
        if (typeof department === "string" && department.trim()) {
            filterConditions.push(
                ilike(departments.name, `%${department}%`)
            );
        }

        // Combine filters
        const whereClause =
            filterConditions.length > 0
                ? and(...filterConditions)
                : undefined;

        // Count query
        const countResult = await db
            .select({
                count: sql<number>`count(*)`
            })
            .from(subjects)
            .leftJoin(
                departments,
                eq(subjects.departmentId, departments.id)
            )
            .where(whereClause);

        const totalCount = Number(countResult[0]?.count ?? 0);

        // Data query
        const subjectList = await db
            .select({
                ...getTableColumns(subjects),
                department: {
                    ...getTableColumns(departments)
                }
            })
            .from(subjects)
            .leftJoin(
                departments,
                eq(subjects.departmentId, departments.id)
            )
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        return res.status(200).json({
            data: subjectList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        });

    } catch (err) {
        console.error("GET /subjects error:", err);

        return res.status(500).json({
            error: "Failed to get subjects"
        });
    }
});

export default router;