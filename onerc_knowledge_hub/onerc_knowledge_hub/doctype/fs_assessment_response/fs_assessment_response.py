# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import json

import frappe
from frappe.model.document import Document
from frappe.utils import flt, now_datetime


class FSAssessmentResponse(Document):
	def validate(self):
		if not self.submitted_on:
			self.submitted_on = now_datetime()
		self.calculate_score()

	def calculate_score(self):
		"""Auto-score the response from the question/option configuration.

		Scoring model (confirmed): a question's score is the sum of the scores
		of the options the respondent selected. Correct options carry points,
		distractors carry 0, and there is no negative marking. The per-question
		maximum is the sum of the scores of its correct options.
		"""
		total = 0.0
		max_total = 0.0

		for ans in self.answers:
			if not ans.question:
				ans.awarded_score = 0
				ans.max_score = 0
				continue

			question = frappe.get_cached_doc("FS Assessment Question", ans.question)

			# Snapshot question metadata so responses stay readable if the
			# question is later edited or removed.
			if not ans.question_text:
				ans.question_text = question.question_text
			if not ans.question_type:
				ans.question_type = question.question_type

			if not question.is_scored:
				ans.awarded_score = 0
				ans.max_score = 0
				continue

			selected = _parse_selected(ans.selected_options)

			ans.awarded_score = sum(
				flt(opt.score) for opt in question.options if opt.option_text in selected
			)
			ans.max_score = sum(flt(opt.score) for opt in question.options if opt.is_correct)

			total += flt(ans.awarded_score)
			max_total += flt(ans.max_score)

		self.total_score = total
		self.max_score = max_total
		self.percentage = (total / max_total * 100) if max_total else 0


def _parse_selected(raw):
	"""Selected options are stored as a JSON list of option texts."""
	if not raw:
		return []
	if isinstance(raw, list):
		return raw
	try:
		value = json.loads(raw)
		return value if isinstance(value, list) else [value]
	except (ValueError, TypeError):
		# Fall back to a single raw string (e.g. a plain "Yes"/"No").
		return [raw]
