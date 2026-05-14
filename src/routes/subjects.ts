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

        const currentPage = Math.max(1, Number(page));
        const limitPerPage = Math.max(1, Number(limit));

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