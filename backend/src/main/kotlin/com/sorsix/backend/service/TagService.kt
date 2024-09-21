package com.sorsix.backend.service

import com.sorsix.backend.api.request.PageableByStringRequest
import com.sorsix.backend.api.request.TagRequest
import com.sorsix.backend.domain.entity.Tag
import com.sorsix.backend.repository.TagRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
class TagService(
    private val tagRepository: TagRepository
) {

    fun getTagById(tagId: Long): Tag? = tagRepository.findById(tagId)
        .orElseThrow { (Exception("Tag with id [$tagId] not found")) }

    fun getTagByName(tagName: String): Tag = tagRepository.findByName(tagName)
        ?: throw Exception("Tag with name [$tagName] not found")


    fun createTag(tagRequest: TagRequest): Tag {
        return tagRepository.findByName(tagRequest.name.lowercase())
            ?: tagRepository.save(Tag(name = tagRequest.name.lowercase()))
    }


    fun updateTag(tagId: Long, tagRequest: TagRequest): Tag {
        val existingTag = getTagById(tagId)
            ?: throw Exception("Tag with id [$tagId] not found")

        val updatedTag = existingTag.copy(name = tagRequest.name)

        return tagRepository.save(updatedTag)
    }

    fun deleteTag(tagId: Long) {
        val tag = tagRepository.findById(tagId)
            .orElseThrow { Exception("Tag with id [$tagId] not found") }
        tagRepository.delete(tag)
    }

    fun searchTags(request: PageableByStringRequest): Page<Tag> {
        val pageable: Pageable = PageRequest.of(
            request.page,
            request.size,
        )
        return tagRepository.findAllByNameContaining(request.word.lowercase(), pageable)
    }
}