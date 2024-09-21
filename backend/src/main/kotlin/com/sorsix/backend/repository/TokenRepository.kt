package com.sorsix.backend.repository

import com.sorsix.backend.domain.entity.Token
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface TokenRepository : JpaRepository<Token, Long> {
    @Query("select t from Token t inner join t.user u where u.username = :username and (t.expired = false or t.revoked = false)")
    fun findAllValidTokensByUser(@Param("username") username: String): List<Token>

    fun findByToken(token: String): Token?
    fun findByUserUsernameAndExpiredFalseAndRevokedFalse(username: String): Token?
    fun existsByUserUsernameAndExpiredFalseAndRevokedFalse(username: String): Boolean

}
